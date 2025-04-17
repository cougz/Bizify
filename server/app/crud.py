from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, extract
import sqlalchemy.orm
from datetime import datetime, timedelta
import io
from typing import List, Optional

from app import models, schemas
from app.pdf_generator import generate_pdf

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=user.password  # Note: This should be hashed in auth.py
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        for key, value in user.dict(exclude_unset=True).items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

# Customer CRUD operations
def get_customer(db: Session, customer_id: int, user_id: int):
    return db.query(models.Customer).filter(
        models.Customer.id == customer_id,
        models.Customer.user_id == user_id
    ).first()

def get_customers(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).filter(
        models.Customer.user_id == user_id
    ).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: schemas.CustomerCreate, user_id: int):
    db_customer = models.Customer(**customer.dict(), user_id=user_id)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def update_customer(db: Session, customer_id: int, customer: schemas.CustomerUpdate):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if db_customer:
        for key, value in customer.dict(exclude_unset=True).items():
            setattr(db_customer, key, value)
        db.commit()
        db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if db_customer:
        db.delete(db_customer)
        db.commit()
    return db_customer

def get_customer_stats(db: Session, user_id: int):
    # Total customers
    total_customers = db.query(func.count(models.Customer.id)).filter(
        models.Customer.user_id == user_id
    ).scalar()
    
    # New customers this month
    current_date = datetime.utcnow()
    first_day_of_month = datetime(current_date.year, current_date.month, 1)
    new_customers_this_month = db.query(func.count(models.Customer.id)).filter(
        models.Customer.user_id == user_id,
        models.Customer.created_at >= first_day_of_month
    ).scalar()
    
    # Active customers (with at least one invoice)
    active_customers = db.query(func.count(models.Customer.id)).filter(
        models.Customer.user_id == user_id,
        models.Customer.invoices.any()
    ).scalar()
    
    # Top customers by revenue
    top_customers_query = db.query(
        models.Customer.id,
        models.Customer.name,
        models.Customer.company,
        func.sum(models.Invoice.total).label("total_spent")
    ).join(models.Invoice).filter(
        models.Customer.user_id == user_id,
        models.Invoice.status == models.InvoiceStatus.PAID
    ).group_by(
        models.Customer.id
    ).order_by(
        desc("total_spent")
    ).limit(5)
    
    top_customers = [
        {
            "id": customer.id,
            "name": customer.name,
            "company": customer.company,
            "total_spent": float(customer.total_spent) if customer.total_spent else 0.0
        }
        for customer in top_customers_query
    ]
    
    return {
        "total_customers": total_customers,
        "new_customers_this_month": new_customers_this_month,
        "active_customers": active_customers,
        "top_customers": top_customers
    }

# Invoice CRUD operations
def get_invoice(db: Session, invoice_id: int, user_id: int):
    return db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.user_id == user_id
    ).first()

def get_invoices(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    # Get invoices that have valid customers
    invoices = db.query(models.Invoice).join(
        models.Customer, models.Invoice.customer_id == models.Customer.id
    ).filter(
        models.Invoice.user_id == user_id
    ).order_by(models.Invoice.created_at.desc()).offset(skip).limit(limit).all()
    
    return invoices

def create_invoice(db: Session, invoice: schemas.InvoiceCreate, user_id: int):
    # Get the next invoice number
    settings = db.query(models.Settings).filter(models.Settings.user_id == user_id).first()
    prefix = settings.invoice_prefix if settings else "INV-"
    
    # Count existing invoices for this user
    invoice_count = db.query(func.count(models.Invoice.id)).filter(
        models.Invoice.user_id == user_id
    ).scalar()
    
    # Generate invoice number
    invoice_number = f"{prefix}{datetime.utcnow().year}-{invoice_count + 1:03d}"
    
    # Create invoice
    db_invoice = models.Invoice(
        invoice_number=invoice_number,
        customer_id=invoice.customer_id,
        user_id=user_id,
        issue_date=invoice.issue_date or datetime.utcnow(),
        due_date=invoice.due_date,
        status=invoice.status,
        notes=invoice.notes,
        tax_rate=invoice.tax_rate,
        discount=invoice.discount,
        subtotal=0.0,  # Will be calculated from items
        tax_amount=0.0,  # Will be calculated
        total=0.0  # Will be calculated
    )
    db.add(db_invoice)
    db.flush()  # Get the invoice ID without committing
    
    # Add invoice items
    subtotal = 0.0
    for item_data in invoice.items:
        amount = item_data.quantity * item_data.unit_price
        subtotal += amount
        
        db_item = models.InvoiceItem(
            invoice_id=db_invoice.id,
            description=item_data.description,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            amount=amount
        )
        db.add(db_item)
    
    # Calculate totals
    tax_amount = subtotal * (db_invoice.tax_rate / 100)
    total = subtotal - db_invoice.discount + tax_amount
    
    # Update invoice with calculated values
    db_invoice.subtotal = subtotal
    db_invoice.tax_amount = tax_amount
    db_invoice.total = total
    
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def update_invoice(db: Session, invoice_id: int, invoice: schemas.InvoiceUpdate):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not db_invoice:
        return None
    
    # Update invoice fields
    update_data = invoice.dict(exclude_unset=True)
    items_data = update_data.pop("items", None)
    
    for key, value in update_data.items():
        setattr(db_invoice, key, value)
    
    # Update items if provided
    if items_data is not None:
        # Get existing items
        existing_items = {item.id: item for item in db_invoice.items}
        
        # Track which items to keep
        items_to_keep = set()
        
        # Update or create items
        subtotal = 0.0
        for item_data in items_data:
            item_id = item_data.get("id")
            
            if item_id and item_id in existing_items:
                # Update existing item
                db_item = existing_items[item_id]
                for key, value in item_data.items():
                    if value is not None and key != "id":
                        setattr(db_item, key, value)
                
                # Recalculate amount
                db_item.amount = db_item.quantity * db_item.unit_price
                items_to_keep.add(item_id)
            else:
                # Create new item
                db_item = models.InvoiceItem(
                    invoice_id=db_invoice.id,
                    description=item_data.get("description", ""),
                    quantity=item_data.get("quantity", 1.0),
                    unit_price=item_data.get("unit_price", 0.0),
                    amount=item_data.get("quantity", 1.0) * item_data.get("unit_price", 0.0)
                )
                db.add(db_item)
            
            subtotal += db_item.amount
        
        # Delete items not in the update
        for item_id, item in existing_items.items():
            if item_id not in items_to_keep:
                db.delete(item)
        
        # Recalculate totals
        db_invoice.subtotal = subtotal
        db_invoice.tax_amount = subtotal * (db_invoice.tax_rate / 100)
        db_invoice.total = db_invoice.subtotal - db_invoice.discount + db_invoice.tax_amount
    
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def delete_invoice(db: Session, invoice_id: int):
    # Get the invoice with eager loading of customer to avoid DetachedInstanceError
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    
    if db_invoice:
        # Store basic info before deletion for return value
        invoice_info = {
            "id": db_invoice.id,
            "invoice_number": db_invoice.invoice_number,
            "status": db_invoice.status
        }
        
        # Delete the invoice
        db.delete(db_invoice)
        db.commit()
        
        # Return basic info instead of the deleted object
        return invoice_info
    
    return None

def generate_invoice_pdf(db: Session, invoice_id: int):
    """
    Generate a PDF for an invoice with proper eager loading of relationships
    """
    # Get invoice with related data with eager loading
    invoice = db.query(models.Invoice).options(
        # Eagerly load the customer relationship to avoid DetachedInstanceError
        joinedload(models.Invoice.customer),
        # Eagerly load the items relationship
        joinedload(models.Invoice.items)
    ).filter(models.Invoice.id == invoice_id).first()
    
    if not invoice:
        return None
    
    # Get user settings
    settings = db.query(models.Settings).filter(models.Settings.user_id == invoice.user_id).first()
    
    # Create a deep copy of the invoice to avoid modifying the database object
    from copy import deepcopy
    invoice_copy = deepcopy(invoice)
    
    # Make a reference to the customer to ensure it's available in the PDF generator
    customer = invoice.customer
    invoice_copy.customer = customer
    
    # Force the status to be a simple string, completely replacing the Enum object
    # Extract the raw status value and convert it to a simple string
    if hasattr(invoice.status, 'value'):
        # If it's an enum
        raw_status = invoice.status.value
    else:
        # Otherwise, convert to string and clean up
        raw_status = str(invoice.status).lower()
        if '{' in raw_status:
            raw_status = 'draft'
    
    # Replace the entire status attribute with a simple string
    # This completely replaces the Enum object with a string
    invoice_copy.status = raw_status
    
    print(f"DEBUG - Final status type: {type(invoice_copy.status)}")
    print(f"DEBUG - Final status value: {invoice_copy.status}")
    
    # Generate PDF
    pdf_bytes = generate_pdf(invoice_copy, settings)
    
    return pdf_bytes

def get_invoice_stats(db: Session, user_id: int):
    # Total invoices
    total_invoices = db.query(func.count(models.Invoice.id)).filter(
        models.Invoice.user_id == user_id
    ).scalar()
    
    # Invoices by status
    paid_invoices = db.query(func.count(models.Invoice.id)).filter(
        models.Invoice.user_id == user_id,
        models.Invoice.status == models.InvoiceStatus.PAID
    ).scalar()
    
    pending_invoices = db.query(func.count(models.Invoice.id)).filter(
        models.Invoice.user_id == user_id,
        models.Invoice.status == models.InvoiceStatus.PENDING
    ).scalar()
    
    overdue_invoices = db.query(func.count(models.Invoice.id)).filter(
        models.Invoice.user_id == user_id,
        models.Invoice.status == models.InvoiceStatus.OVERDUE
    ).scalar()
    
    # Total revenue
    total_revenue = db.query(func.sum(models.Invoice.total)).filter(
        models.Invoice.user_id == user_id,
        models.Invoice.status == models.InvoiceStatus.PAID
    ).scalar() or 0.0
    
    # Revenue this month
    current_date = datetime.utcnow()
    first_day_of_month = datetime(current_date.year, current_date.month, 1)
    revenue_this_month = db.query(func.sum(models.Invoice.total)).filter(
        models.Invoice.user_id == user_id,
        models.Invoice.status == models.InvoiceStatus.PAID,
        models.Invoice.issue_date >= first_day_of_month
    ).scalar() or 0.0
    
    # Revenue last month
    last_month = current_date.replace(day=1) - timedelta(days=1)
    first_day_of_last_month = datetime(last_month.year, last_month.month, 1)
    last_day_of_last_month = datetime(current_date.year, current_date.month, 1) - timedelta(days=1)
    
    revenue_last_month = db.query(func.sum(models.Invoice.total)).filter(
        models.Invoice.user_id == user_id,
        models.Invoice.status == models.InvoiceStatus.PAID,
        models.Invoice.issue_date >= first_day_of_last_month,
        models.Invoice.issue_date <= last_day_of_last_month
    ).scalar() or 0.0
    
    # Monthly revenue for the last 6 months
    monthly_revenue = []
    for i in range(5, -1, -1):
        month_date = current_date.replace(day=1) - timedelta(days=i*30)
        month_start = datetime(month_date.year, month_date.month, 1)
        month_end = (month_start.replace(month=month_start.month+1) if month_start.month < 12 
                    else month_start.replace(year=month_start.year+1, month=1)) - timedelta(days=1)
        
        month_revenue = db.query(func.sum(models.Invoice.total)).filter(
            models.Invoice.user_id == user_id,
            models.Invoice.status == models.InvoiceStatus.PAID,
            models.Invoice.issue_date >= month_start,
            models.Invoice.issue_date <= month_end
        ).scalar() or 0.0
        
        monthly_revenue.append({
            "month": month_start.strftime("%b"),
            "revenue": float(month_revenue)
        })
    
    return {
        "total_invoices": total_invoices,
        "paid_invoices": paid_invoices,
        "pending_invoices": pending_invoices,
        "overdue_invoices": overdue_invoices,
        "total_revenue": float(total_revenue),
        "revenue_this_month": float(revenue_this_month),
        "revenue_last_month": float(revenue_last_month),
        "monthly_revenue": monthly_revenue
    }

# Dashboard data
def get_dashboard_data(db: Session, user_id: int):
    # Get basic stats
    total_customers = db.query(func.count(models.Customer.id)).filter(
        models.Customer.user_id == user_id
    ).scalar()
    
    total_invoices = db.query(func.count(models.Invoice.id)).filter(
        models.Invoice.user_id == user_id
    ).scalar()
    
    paid_invoices = db.query(func.count(models.Invoice.id)).filter(
        models.Invoice.user_id == user_id,
        models.Invoice.status == models.InvoiceStatus.PAID
    ).scalar()
    
    pending_invoices = db.query(func.count(models.Invoice.id)).filter(
        models.Invoice.user_id == user_id,
        models.Invoice.status == models.InvoiceStatus.PENDING
    ).scalar()
    
    overdue_invoices = db.query(func.count(models.Invoice.id)).filter(
        models.Invoice.user_id == user_id,
        models.Invoice.status == models.InvoiceStatus.OVERDUE
    ).scalar()
    
    # Total revenue
    total_revenue = db.query(func.sum(models.Invoice.total)).filter(
        models.Invoice.user_id == user_id,
        models.Invoice.status == models.InvoiceStatus.PAID
    ).scalar() or 0.0
    
    # Revenue change (comparing this month to last month)
    current_date = datetime.utcnow()
    first_day_of_month = datetime(current_date.year, current_date.month, 1)
    
    # This month's revenue
    revenue_this_month = db.query(func.sum(models.Invoice.total)).filter(
        models.Invoice.user_id == user_id,
        models.Invoice.status == models.InvoiceStatus.PAID,
        models.Invoice.issue_date >= first_day_of_month
    ).scalar() or 0.0
    
    # Last month's revenue
    last_month = current_date.replace(day=1) - timedelta(days=1)
    first_day_of_last_month = datetime(last_month.year, last_month.month, 1)
    last_day_of_last_month = datetime(current_date.year, current_date.month, 1) - timedelta(days=1)
    
    revenue_last_month = db.query(func.sum(models.Invoice.total)).filter(
        models.Invoice.user_id == user_id,
        models.Invoice.status == models.InvoiceStatus.PAID,
        models.Invoice.issue_date >= first_day_of_last_month,
        models.Invoice.issue_date <= last_day_of_last_month
    ).scalar() or 0.0
    
    # Calculate percentage change
    revenue_change = 0.0
    if revenue_last_month > 0:
        revenue_change = ((revenue_this_month - revenue_last_month) / revenue_last_month) * 100
    
    # Revenue data for the last 6 months
    revenue_data = []
    for i in range(5, -1, -1):
        month_date = current_date.replace(day=1) - timedelta(days=i*30)
        month_start = datetime(month_date.year, month_date.month, 1)
        month_end = (month_start.replace(month=month_start.month+1) if month_start.month < 12 
                    else month_start.replace(year=month_start.year+1, month=1)) - timedelta(days=1)
        
        month_revenue = db.query(func.sum(models.Invoice.total)).filter(
            models.Invoice.user_id == user_id,
            models.Invoice.status == models.InvoiceStatus.PAID,
            models.Invoice.issue_date >= month_start,
            models.Invoice.issue_date <= month_end
        ).scalar() or 0.0
        
        revenue_data.append({
            "month": month_start.strftime("%b"),
            "revenue": float(month_revenue)
        })
    
    # Invoice status data
    invoice_status_data = {
        "labels": ["Paid", "Pending", "Overdue"],
        "data": [paid_invoices, pending_invoices, overdue_invoices]
    }
    
    return {
        "total_customers": total_customers,
        "total_invoices": total_invoices,
        "total_revenue": float(total_revenue),
        "revenue_change": float(revenue_change),
        "pending_invoices": pending_invoices,
        "paid_invoices": paid_invoices,
        "overdue_invoices": overdue_invoices,
        "revenue_data": revenue_data,
        "invoice_status_data": invoice_status_data
    }

# Settings CRUD operations
def get_settings(db: Session, user_id: int):
    # Debug: Print all settings records for this user
    all_settings = db.query(models.Settings).filter(models.Settings.user_id == user_id).all()
    print(f"Found {len(all_settings)} settings records for user {user_id}")
    for i, s in enumerate(all_settings):
        print(f"Settings {i+1}: id={s.id}, company_name={s.company_name}, updated_at={s.updated_at}")
    
    # Get the most recently updated settings
    settings = db.query(models.Settings).filter(
        models.Settings.user_id == user_id
    ).order_by(models.Settings.updated_at.desc()).first()
    
    # If no settings found, fall back to any settings for this user
    if not settings:
        settings = db.query(models.Settings).filter(models.Settings.user_id == user_id).first()
    
    return settings

def create_settings(db: Session, settings: schemas.SettingsCreate, user_id: int):
    db_settings = models.Settings(**settings.dict(), user_id=user_id)
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings

# Reset user data
def reset_user_data(db: Session, user_id: int):
    """
    Reset all data for a user:
    - Delete all invoices and invoice items
    - Delete all customers
    - Delete all settings
    - Create default settings
    """
    try:
        # Delete all invoices (cascade will delete invoice items)
        invoices = db.query(models.Invoice).filter(models.Invoice.user_id == user_id).all()
        for invoice in invoices:
            db.delete(invoice)
        
        # Delete all customers
        customers = db.query(models.Customer).filter(models.Customer.user_id == user_id).all()
        for customer in customers:
            db.delete(customer)
        
        # Delete all settings
        settings = db.query(models.Settings).filter(models.Settings.user_id == user_id).all()
        for setting in settings:
            db.delete(setting)
        
        # Commit the deletions
        db.commit()
        
        # Create default settings
        default_settings = models.Settings(
            user_id=user_id,
            company_name="Your Company",
            company_address="123 Main St",
            company_city="Your City",
            company_state="Your State",
            company_zip="12345",
            company_country="Your Country",
            company_phone="(123) 456-7890",
            company_email="info@yourcompany.com",
            company_website="www.yourcompany.com",
            tax_rate=10.0,
            currency="USD",
            invoice_prefix="INV-",
            invoice_footer="Thank you for your business!",
            bank_name="",
            bank_iban="",
            bank_bic=""
        )
        db.add(default_settings)
        db.commit()
        db.refresh(default_settings)
        
        return {"status": "success", "message": "All data has been reset to defaults"}
    except Exception as e:
        db.rollback()
        print(f"Error resetting user data: {e}")
        raise

def update_settings(db: Session, settings: schemas.SettingsUpdate, user_id: int):
    # Get all settings for this user
    all_settings = db.query(models.Settings).filter(models.Settings.user_id == user_id).all()
    print(f"Updating settings for user {user_id}, found {len(all_settings)} settings records")
    
    # If there are multiple settings records, keep only the most recently updated one
    if len(all_settings) > 1:
        print(f"Multiple settings found for user {user_id}, cleaning up...")
        # Sort by updated_at (newest first)
        sorted_settings = sorted(all_settings, key=lambda s: s.updated_at if s.updated_at else s.created_at, reverse=True)
        
        # Keep the first one (most recent) and delete the rest
        for s in sorted_settings[1:]:
            print(f"Deleting duplicate settings record id={s.id}, company_name={s.company_name}")
            db.delete(s)
        
        db.commit()
        db_settings = sorted_settings[0]
    else:
        # Get the single settings record
        db_settings = db.query(models.Settings).filter(models.Settings.user_id == user_id).first()
    
    # Update the settings
    if db_settings:
        print(f"Updating settings id={db_settings.id}, company_name={db_settings.company_name} -> {settings.company_name}")
        for key, value in settings.dict(exclude_unset=True).items():
            setattr(db_settings, key, value)
        db.commit()
        db.refresh(db_settings)
    else:
        # Create new settings if none exist
        print(f"No settings found for user {user_id}, creating new settings")
        db_settings = models.Settings(**settings.dict(), user_id=user_id)
        db.add(db_settings)
        db.commit()
        db.refresh(db_settings)
    
    return db_settings
