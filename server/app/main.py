from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import importlib.util
import os
import sys

from app.database import engine, get_db
from app import models, schemas, crud
from app.auth import auth_router, get_current_user

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Run migrations
try:
    # Add the server directory to the path so we can import the migrations module
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Import and run migrations using the migration manager
    from app.migration_manager import run_migrations
    run_migrations()
except Exception as e:
    print(f"Error running migrations: {e}")

app = FastAPI(title="Bizify API", description="Business Management API", version="0.1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For security in a real-world scenario, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to Bizify API"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Version endpoint
@app.get("/api/version")
def get_app_version():
    """Get the current application version"""
    from app.version import get_version
    return get_version()

# Helper function to get or create a default user
def get_default_user(db: Session):
    user = db.query(models.User).first()
    if not user:
        # Create a default user if none exists
        user = models.User(
            email="admin@example.com",
            name="Admin User",
            hashed_password="admin"  # This is just for demo
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@app.post("/api/customers", response_model=schemas.Customer)
def create_customer(
    customer: schemas.CustomerCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_customer(db=db, customer=customer, user_id=current_user.id)

@app.get("/api/customers", response_model=List[schemas.Customer])
def read_customers(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    customers = crud.get_customers(db, user_id=current_user.id, skip=skip, limit=limit)
    return customers

@app.get("/api/customers/stats", response_model=schemas.CustomerStats)
def get_customer_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_customer_stats(db=db, user_id=current_user.id)

@app.get("/api/customers/{customer_id}", response_model=schemas.Customer)
def read_customer(
    customer_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    customer = crud.get_customer(db, customer_id=customer_id, user_id=current_user.id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@app.put("/api/customers/{customer_id}", response_model=schemas.Customer)
def update_customer(
    customer_id: int, 
    customer: schemas.CustomerUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_customer = crud.get_customer(db, customer_id=customer_id, user_id=current_user.id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return crud.update_customer(db=db, customer_id=customer_id, customer=customer)

@app.delete("/api/customers/{customer_id}", response_model=schemas.Customer)
def delete_customer(
    customer_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_customer = crud.get_customer(db, customer_id=customer_id, user_id=current_user.id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return crud.delete_customer(db=db, customer_id=customer_id)

# Invoice endpoints
@app.post("/api/invoices", response_model=schemas.Invoice)
def create_invoice(
    invoice: schemas.InvoiceCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_invoice(db=db, invoice=invoice, user_id=current_user.id)

@app.get("/api/invoices", response_model=List[schemas.Invoice])
def read_invoices(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    invoices = crud.get_invoices(db, user_id=current_user.id, skip=skip, limit=limit)
    return invoices

@app.get("/api/invoices/stats", response_model=schemas.InvoiceStats)
def get_invoice_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_invoice_stats(db=db, user_id=current_user.id)

@app.get("/api/invoices/{invoice_id}/pdf")
def generate_invoice_pdf(
    invoice_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Get invoice with user_id check
    invoice = crud.get_invoice(db, invoice_id=invoice_id, user_id=current_user.id)
    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Generate PDF and return it
    pdf_bytes = crud.generate_invoice_pdf(db=db, invoice_id=invoice_id)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=invoice_{invoice_id}.pdf"
        }
    )

@app.get("/api/invoices/{invoice_id}", response_model=schemas.Invoice)
def read_invoice(
    invoice_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    invoice = crud.get_invoice(db, invoice_id=invoice_id, user_id=current_user.id)
    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@app.put("/api/invoices/{invoice_id}", response_model=schemas.Invoice)
def update_invoice(
    invoice_id: int, 
    invoice: schemas.InvoiceUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_invoice = crud.get_invoice(db, invoice_id=invoice_id, user_id=current_user.id)
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return crud.update_invoice(db=db, invoice_id=invoice_id, invoice=invoice)

@app.delete("/api/invoices/{invoice_id}")
def delete_invoice(
    invoice_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_invoice = crud.get_invoice(db, invoice_id=invoice_id, user_id=current_user.id)
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Delete the invoice
    result = crud.delete_invoice(db=db, invoice_id=invoice_id)
    
    # Return a simple success message instead of the deleted invoice
    return {"status": "success", "message": f"Invoice {invoice_id} deleted successfully"}

# Dashboard endpoints
@app.get("/api/dashboard", response_model=schemas.DashboardData)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_dashboard_data(db=db, user_id=current_user.id)

# Settings endpoints
@app.get("/api/settings", response_model=schemas.Settings)
def get_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    settings = crud.get_settings(db=db, user_id=current_user.id)
    if settings is None:
        # Create default settings if none exist
        settings = crud.create_settings(
            db=db, 
            settings=schemas.SettingsCreate(
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
                invoice_footer="Thank you for your business!"
            ),
            user_id=current_user.id
        )
    return settings

@app.put("/api/settings", response_model=schemas.Settings)
def update_settings(
    settings: schemas.SettingsUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_settings = crud.get_settings(db=db, user_id=current_user.id)
    if db_settings is None:
        # Create settings if none exist
        return crud.create_settings(db=db, settings=settings, user_id=current_user.id)
    return crud.update_settings(db=db, settings=settings, user_id=current_user.id)

@app.post("/api/settings/reset")
def reset_user_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Reset all user data to defaults:
    - Delete all invoices and invoice items
    - Delete all customers
    - Delete all settings
    - Create default settings
    """
    return crud.reset_user_data(db=db, user_id=current_user.id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
