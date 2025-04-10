"""
Database migration script to create initial tables.
This script should be run once to initialize the database schema.
"""

import sys
import os
import logging
from pathlib import Path

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import engine
from app import models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    logger.info("Creating database tables...")
    try:
        models.Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

if __name__ == "__main__":
    logger.info("Starting database migration...")
    create_tables()
    logger.info("Database migration completed.")
