#!/usr/bin/env python
"""
Script to generate mockup data for Bizify.
This script creates sample customers, invoices and company information
for demonstration and screenshot purposes.
"""

import sys
import os
import logging
import random
from datetime import datetime, timedelta
from passlib.context import CryptContext
import argparse

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import models
from app.auth import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_or_update_user(db, email, name, password="password123"):
    """Create a user or update if it already exists."""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        logger.info(f"Creating user: {email}")
        user = models.User(
            email=email,
            name=name,
            hashed_password=get_password_hash(password),
            is_active=True
        )
        db.add(user)
        db.flush()
    else:
        logger.info(f"User {email} already exists, updating...")
        user.name = name
        user.hashed_password = get_password_hash(password)
    
    return user

def update_company_settings(db, user_id):
    """Update the company settings with more realistic data."""
    settings = db.query(models.Settings).filter(models.Settings.user_id == user_id).first()
    
    if not settings:
        logger.info(f"Creating settings for user {user_id}")
        settings = models.Settings(user_id=user_id)
        db.add(settings)
    
    settings.company_name = "Acme Technology Solutions"
    settings.company_address = "123 Innovation Drive"
    settings.company_city = "San Francisco"
    settings.company_state = "CA"
    settings.company_zip = "94107"
    settings.company_country = "United States"
    settings.company_phone = "(415) 555-1234"
    settings.company_email = "info@acmetech.example"
    settings.company_website = "www.acmetech.example"
    settings.tax_rate = 8.5
    settings.currency = "USD"
    settings.invoice_prefix = "INV-"
    settings.invoice_footer = "Thank you for your business. Payment is due within 30 days of invoice date."
    settings.bank_name = "First National Bank"
    settings.bank_iban = "US98765432100001234"
    settings.bank_bic = "FNBKUS12"
    settings.language = "en"
    
    logger.info(f"Updated company settings for {settings.company_name}")
    return settings

def create_sample_customers(db, user_id, count=6):
    """Create sample customers for the user."""
    company_domains = ["example.com", "demo.net", "sample.org", "test.io", "mockup.co", "bizdev.tech"]
    
    sample_customers = [
        {
            "name": "John Smith",
            "company": "Smith Enterprises",
            "email": f"john.smith@{random.choice(company_domains)}",
            "phone": "(555) 123-4567",
            "address": "42 Main Street",
            "city": "Boston",
            "state": "MA",
            "zip_code": "02108",
            "country": "United States"
        },
        {
            "name": "Emma Johnson",
            "company": "Johnson Digital",
            "email": f"emma.johnson@{random.choice(company_domains)}",
            "phone": "(555) 234-5678",
            "address": "789 Tech Blvd",
            "city": "Austin",
            "state": "TX",
            "zip_code": "73301",
            "country": "United States"
        },
        {
            "name": "Michael Brown",
            "company": "Brown Design Group",
            "email": f"michael.brown@{random.choice(company_domains)}",
            "phone": "(555) 345-6789",
            "address": "567 Creative Lane",
            "city": "Portland",
            "state": "OR",
            "zip_code": "97204",
            "country": "United States"
        },
        {
            "name": "Sarah Lee",
            "company": "Lee Consulting",
            "email": f"sarah.lee@{random.choice(company_domains)}",
            "phone": "(555) 456-7890",
            "address": "123 Business Way",
            "city": "Chicago",
            "state": "IL",
            "zip_code": "60601",
            "country": "United States"
        },
        {
            "name": "David Wang",
            "company": "Wang Technologies",
            "email": f"david.wang@{random.choice(company_domains)}",
            "phone": "(555) 567-8901",
            "address": "888 Innovation Park",
            "city": "Seattle",
            "state": "WA",
            "zip_code": "98101",
            "country": "United States"
        },
        {
            "name": "Jennifer Garcia",
            "company": "Garcia Digital Marketing",
            "email": f"jennifer.garcia@{random.choice(company_domains)}",
            "phone": "(555) 678-9012",
            "address": "555 Marketing Ave",
            "city": "Miami",
            "state": "FL",
            "zip_code": "33101",
            "country": "United States"
        },
        {
            "name": "Robert Schmidt",
            "company": "Schmidt Engineering GmbH",
            "email": f"robert.schmidt@{random.choice(company_domains)}",
            "phone": "+49 30 1234567",
            "address": "Ingenieurstraße 42",
            "city": "Berlin",
            "state": "Berlin",
            "zip_code": "10115",
            "country": "Germany"
        },
        {
            "name": "Sophia Martinez",
            "company": "Martinez Creative Solutions",
            "email": f"sophia.martinez@{random.choice(company_domains)}",
            "phone": "(555) 789-0123",
            "address": "321 Innovation Blvd",
            "city": "San Diego",
            "state": "CA",
            "zip_code": "92101",
            "country": "United States"
        }
    ]
    
    # Take a subset if less than the available samples are requested
    if count < len(sample_customers):
        sample_customers = random.sample(sample_customers, count)
    
    customers = []
    for i, customer_data in enumerate(sample_customers[:count]):
        customer = db.query(models.Customer).filter(
            models.Customer.email == customer_data["email"],
            models.Customer.user_id == user_id
        ).first()
        
        if not customer:
            customer = models.Customer(
                user_id=user_id,
                **customer_data
            )
            db.add(customer)
            logger.info(f"Created customer: {customer_data['name']}")
        else:
            logger.info(f"Customer {customer_data['name']} already exists, updating...")
            for key, value in customer_data.items():
                setattr(customer, key, value)
        
        db.flush()
        customers.append(customer)
    
    return customers

def create_sample_invoices(db, user_id, customers, count=10):
    """Create sample invoices for the user."""
    now = datetime.utcnow()
    statuses = list(models.InvoiceStatus)
    
    # Sample invoice items
    sample_services = [
        {"description": "Web Development", "unit_price": 95.00},
        {"description": "Mobile App Development", "unit_price": 120.00},
        {"description": "UI/UX Design", "unit_price": 85.00},
        {"description": "Database Optimization", "unit_price": 110.00},
        {"description": "Cloud Infrastructure Setup", "unit_price": 150.00},
        {"description": "DevOps Consulting", "unit_price": 125.00},
        {"description": "SEO Optimization", "unit_price": 75.00},
        {"description": "Content Creation", "unit_price": 65.00},
        {"description": "Digital Marketing Campaign", "unit_price": 85.00},
        {"description": "E-commerce Integration", "unit_price": 95.00},
        {"description": "Custom Software Development", "unit_price": 110.00},
        {"description": "API Development", "unit_price": 90.00},
        {"description": "Code Review", "unit_price": 80.00},
        {"description": "Security Audit", "unit_price": 130.00},
        {"description": "Technical Documentation", "unit_price": 70.00},
    ]
    
    # Get the user's invoice prefix
    settings = db.query(models.Settings).filter(models.Settings.user_id == user_id).first()
    prefix = settings.invoice_prefix if settings else "INV-"
    
    # Create invoices distributed over the last 6 months for better charts
    invoices = []
    for i in range(count):
        # Distribute invoices across last 6 months instead of random days
        month_offset = i % 6  # This ensures distribution across 6 months
        days_in_month = 30
        days_ago = (month_offset * days_in_month) + random.randint(0, days_in_month-1)
        
        issue_date = now - timedelta(days=days_ago)
        
        # Due date typically 30 days after issue
        due_date = issue_date + timedelta(days=30)
        
        # REPLACE THIS SECTION: Ensure we have some PAID invoices for each month to show in the revenue chart
        if month_offset < 3:  # For more recent months
            status = random.choice([models.InvoiceStatus.PAID, models.InvoiceStatus.PENDING])
        else:  # For older months
            status = models.InvoiceStatus.PAID if random.random() < 0.8 else models.InvoiceStatus.OVERDUE
        
        # Random customer
        customer = random.choice(customers)
        
        # Invoice number
        invoice_number = f"{prefix}{datetime.now().year}-{i+1:03d}"
        
        # Create invoice with some random variations
        invoice = models.Invoice(
            invoice_number=invoice_number,
            customer_id=customer.id,
            user_id=user_id,
            issue_date=issue_date,
            due_date=due_date,
            status=status,
            notes="Thank you for your business!" if random.random() > 0.7 else "",
            tax_rate=settings.tax_rate if settings else 8.5,
            discount=0.0,  # Will be calculated from items
            subtotal=0.0,  # Will be calculated from items
            tax_amount=0.0,  # Will be calculated
            total=0.0  # Will be calculated
        )
        db.add(invoice)
        db.flush()
        
        # Add 1-5 random items to the invoice
        num_items = random.randint(1, 5)
        selected_services = random.sample(sample_services, num_items)
        
        subtotal = 0.0
        for service in selected_services:
            # Randomize quantity (mostly 1, but sometimes more)
            quantity = 1 if random.random() < 0.7 else random.randint(2, 10)
            
            # Calculate amount
            amount = service["unit_price"] * quantity
            subtotal += amount
            
            # Create the invoice item
            item = models.InvoiceItem(
                invoice_id=invoice.id,
                description=service["description"],
                quantity=quantity,
                unit_price=service["unit_price"],
                amount=amount
            )
            db.add(item)
        
        # Random discount (10% chance of discount)
        discount = 0.0
        if random.random() < 0.1:
            discount_percent = random.choice([5, 10, 15, 20])
            discount = subtotal * (discount_percent / 100)
        
        # Calculate tax and totals
        tax_amount = (subtotal - discount) * (invoice.tax_rate / 100)
        total = subtotal - discount + tax_amount
        
        # Update invoice with calculated values
        invoice.subtotal = subtotal
        invoice.discount = discount
        invoice.tax_amount = tax_amount
        invoice.total = total
        
        logger.info(f"Created invoice {invoice_number} for {customer.name} - {status.name} - {total:.2f}")
        invoices.append(invoice)
    
    return invoices

def create_mockup_data(user_email="demo@example.com", user_name="Demo User", num_customers=6, num_invoices=10):
    """Create mockup data for the specified user."""
    db = SessionLocal()
    
    try:
        # Create or update the user
        user = create_or_update_user(db, user_email, user_name)
        
        # Update company settings
        update_company_settings(db, user.id)
        
        # Create sample customers
        customers = create_sample_customers(db, user.id, count=num_customers)
        
        # Create sample invoices
        invoices = create_sample_invoices(db, user.id, customers, count=num_invoices)
        
        # Commit all changes
        db.commit()
        
        logger.info(f"Successfully created mockup data for {user_name} ({user_email})")
        logger.info(f"Created {len(customers)} customers and {len(invoices)} invoices")
        
        return {
            "user": user,
            "customers": customers,
            "invoices": invoices
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating mockup data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate mockup data for Bizify")
    parser.add_argument("--email", default="demo@example.com", help="Email for the demo user")
    parser.add_argument("--name", default="Demo User", help="Name for the demo user")
    parser.add_argument("--customers", type=int, default=6, help="Number of customers to create")
    parser.add_argument("--invoices", type=int, default=10, help="Number of invoices to create")
    
    args = parser.parse_args()
    
    logger.info("Starting mockup data generation...")
    create_mockup_data(args.email, args.name, args.customers, args.invoices)
    logger.info("Mockup data generation completed.")