"""
Database setup script to create tables and seed initial data.
This script should be run once to set up the database for the application.
"""

import logging
import argparse
from migrations.create_tables import create_tables
from migrations.seed_data import seed_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_database(seed=True):
    """Set up the database by creating tables and optionally seeding data."""
    try:
        # Create tables
        logger.info("Creating database tables...")
        create_tables()
        
        # Seed data if requested
        if seed:
            logger.info("Seeding database with initial data...")
            seed_data()
        
        logger.info("Database setup completed successfully.")
    except Exception as e:
        logger.error(f"Error setting up database: {e}")
        raise

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Set up the database for Bizify.")
    parser.add_argument("--no-seed", action="store_true", help="Skip seeding the database with initial data")
    args = parser.parse_args()
    
    setup_database(not args.no_seed)
