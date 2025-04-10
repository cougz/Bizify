"""
Database seeding script to populate the database with initial test data.
This script should be run after creating the tables to have some data for testing.
"""

import sys
import os
import logging
from pathlib import Path
from datetime import datetime, timedelta
from passlib.context import CryptContext

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import engine, SessionLocal
from app import models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    logger.info("Seeding database with initial data...")
    db = SessionLocal()
    
    try:
        # Check if data already exists
        user_count = db.query(models.User).count()
        if user_count > 0:
            logger.info("Database already has data. Skipping seeding.")
            return
        
        # Create test user
        test_user = models.User(
            email="test@example.com",
            name="Test User",
            hashed_password=get_password_hash("password123"),
            is_active=True
        )
        db.add(test_user)
        db.flush()  # Get the user ID
        
        # Create user settings
        user_settings = models.Settings(
            user_id=test_user.id,
            company_name="Acme Inc.",
            company_address="123 Main St",
            company_city="San Francisco",
            company_state="CA",
            company_zip="94105",
            company_country="USA",
            company_phone="(555) 123-4567",
            company_email="info@acme.com",
            company_website="https://acme.com",
            tax_rate=8.5,
            currency="USD",
            invoice_prefix="INV-"
        )
        db.add(user_settings)
        
        # Create test customers
        customers = [
            models.Customer(
                name="John Doe",
                email="john.doe@example.com",
                phone="(555) 123-4567",
                address="456 Oak St",
                city="San Francisco",
                state="CA",
                zip_code="94107",
                country="USA",
                company="Doe Enterprises",
                user_id=test_user.id
            ),
            models.Customer(
                name="Jane Smith",
                email="jane.smith@example.com",
                phone="(555) 987-6543",
                address="789 Pine St",
                city="San Francisco",
                state="CA",
                zip_code="94108",
                country="USA",
                company="Smith & Co",
                user_id=test_user.id
            ),
            models.Customer(
                name="Bob Johnson",
                email="bob.johnson@example.com",
                phone="(555) 456-7890",
                address="321 Maple Ave",
                city="Oakland",
                state="CA",
                zip_code="94610",
                country="USA",
                company="Johnson Industries",
                user_id=test_user.id
            )
        ]
        db.add_all(customers)
        db.flush()  # Get customer IDs
        
        # Create test invoices
        now = datetime.utcnow()
        invoices = [
            models.Invoice(
                invoice_number="INV-2023-001",
                customer_id=customers[0].id,
                user_id=test_user.id,
                issue_date=now - timedelta(days=30),
                due_date=now - timedelta(days=15),
                status=models.InvoiceStatus.PAID,
                subtotal=1000.00,
                tax_rate=8.5,
                tax_amount=85.00,
                discount=0.00,
                total=1085.00
            ),
            models.Invoice(
                invoice_number="INV-2023-002",
                customer_id=customers[1].id,
                user_id=test_user.id,
                issue_date=now - timedelta(days=15),
                due_date=now + timedelta(days=15),
                status=models.InvoiceStatus.PENDING,
                subtotal=1500.00,
                tax_rate=8.5,
                tax_amount=127.50,
                discount=100.00,
                total=1527.50
            ),
            models.Invoice(
                invoice_number="INV-2023-003",
                customer_id=customers[2].id,
                user_id=test_user.id,
                issue_date=now - timedelta(days=45),
                due_date=now - timedelta(days=15),
                status=models.InvoiceStatus.OVERDUE,
                subtotal=2000.00,
                tax_rate=8.5,
                tax_amount=170.00,
                discount=0.00,
                total=2170.00
            )
        ]
        db.add_all(invoices)
        db.flush()  # Get invoice IDs
        
        # Create invoice items
        invoice_items = [
            # Items for first invoice
            models.InvoiceItem(
                invoice_id=invoices[0].id,
                description="Web Design",
                quantity=1.0,
                unit_price=500.00,
                amount=500.00
            ),
            models.InvoiceItem(
                invoice_id=invoices[0].id,
                description="Web Development",
                quantity=1.0,
                unit_price=500.00,
                amount=500.00
            ),
            # Items for second invoice
            models.InvoiceItem(
                invoice_id=invoices[1].id,
                description="Logo Design",
                quantity=1.0,
                unit_price=500.00,
                amount=500.00
            ),
            models.InvoiceItem(
                invoice_id=invoices[1].id,
                description="Branding Package",
                quantity=1.0,
                unit_price=1000.00,
                amount=1000.00
            ),
            # Items for third invoice
            models.InvoiceItem(
                invoice_id=invoices[2].id,
                description="E-commerce Development",
                quantity=1.0,
                unit_price=2000.00,
                amount=2000.00
            )
        ]
        db.add_all(invoice_items)
        
        # Commit all changes
        db.commit()
        logger.info("Database seeded successfully.")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Starting database seeding...")
    seed_data()
    logger.info("Database seeding completed.")
