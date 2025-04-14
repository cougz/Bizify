#!/usr/bin/env python3
"""
Script to create a user for Bizify.
This script should be run after setting up the database but before running the application.
"""

import sys
import os
import logging
from pathlib import Path
from getpass import getpass
import re
from passlib.context import CryptContext

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import engine, SessionLocal
from app import models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def validate_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def create_user():
    """Create a user with proper credentials."""
    logger.info("Creating user...")
    
    # Get user input
    print("\n=== Bizify User Setup ===\n")
    
    # Email
    while True:
        email = input("Enter email address: ").strip()
        if validate_email(email):
            break
        print("Invalid email format. Please try again.")
    
    # Name
    name = input("Enter full name: ").strip()
    while not name:
        print("Name cannot be empty.")
        name = input("Enter full name: ").strip()
    
    # Password
    while True:
        password = getpass("Enter password (min 8 characters): ")
        if len(password) < 8:
            print("Password must be at least 8 characters long.")
            continue
            
        password_confirm = getpass("Confirm password: ")
        if password != password_confirm:
            print("Passwords do not match. Please try again.")
            continue
            
        break
    
    # Create user in database
    db = SessionLocal()
    try:
        # Check if user with this email already exists
        existing_user = db.query(models.User).filter(models.User.email == email).first()
        if existing_user:
            logger.info(f"User with email {email} already exists.")
            return
        
        # Create new user
        new_user = models.User(
            email=email,
            name=name,
            hashed_password=get_password_hash(password),
            is_active=True
        )
        db.add(new_user)
        db.flush()  # Get the user ID
        
        # Create default settings for the user
        user_settings = models.Settings(
            user_id=new_user.id,
            company_name="Your Company",
            company_address="Your Address",
            company_city="Your City",
            company_state="Your State",
            company_zip="Your ZIP",
            company_country="Your Country",
            company_phone="Your Phone",
            company_email=email,
            company_website="Your Website",
            tax_rate=0.0,
            currency="USD",
            invoice_prefix="INV-"
        )
        db.add(user_settings)
        
        # Commit all changes
        db.commit()
        logger.info(f"User {email} created successfully.")
        print(f"\nUser {email} created successfully. You can now run the application.")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user: {e}")
        print(f"\nError creating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Starting user creation...")
    create_user()
