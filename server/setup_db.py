"""
Database setup script to create tables and seed initial data.
This script should be run once to set up the database for the application.
"""

import logging
import argparse
import sys
import os
from sqlalchemy.exc import OperationalError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_database(seed=True):
    """Set up the database by creating tables and optionally seeding data."""
    try:
        # Import here to avoid circular imports
        from migrations.create_tables import create_tables
        from migrations.seed_data import seed_data
        
        # Create tables
        logger.info("Creating database tables...")
        create_tables()
        
        # Seed data if requested
        if seed:
            logger.info("Seeding database with initial data...")
            seed_data()
        
        logger.info("Database setup completed successfully.")
        return True
    except OperationalError as e:
        logger.error(f"Database connection error: {e}")
        logger.warning("Make sure PostgreSQL is running and accessible.")
        logger.info("For local development without Docker, you may need to:")
        logger.info("1. Install PostgreSQL")
        logger.info("2. Create a database named 'bizify'")
        logger.info("3. Create a user 'bizify' with password 'bizify_password'")
        logger.info("4. Grant all privileges on database 'bizify' to user 'bizify'")
        logger.info("5. Run this script again")
        return False
    except Exception as e:
        logger.error(f"Error setting up database: {e}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Set up the database for Bizify.")
    parser.add_argument("--no-seed", action="store_true", help="Skip seeding the database with initial data")
    args = parser.parse_args()
    
    success = setup_database(not args.no_seed)
    if not success:
        sys.exit(1)
