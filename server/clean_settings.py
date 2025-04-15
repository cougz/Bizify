"""
Script to clean up duplicate settings records in the database.
This script will find all users with multiple settings records and keep only the most recently updated one.
"""

import sys
import os
import logging
from pathlib import Path
from datetime import datetime

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import engine, SessionLocal
from app import models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clean_settings():
    logger.info("Cleaning up duplicate settings records...")
    db = SessionLocal()
    
    try:
        # Get all users
        users = db.query(models.User).all()
        
        for user in users:
            # Get all settings for this user
            settings = db.query(models.Settings).filter(models.Settings.user_id == user.id).all()
            
            if len(settings) > 1:
                logger.info(f"User {user.id} ({user.email}) has {len(settings)} settings records. Cleaning up...")
                
                # Sort by updated_at (newest first)
                sorted_settings = sorted(
                    settings, 
                    key=lambda s: s.updated_at if s.updated_at else s.created_at, 
                    reverse=True
                )
                
                # Keep the first one (most recent) and delete the rest
                for s in sorted_settings[1:]:
                    logger.info(f"Deleting duplicate settings record id={s.id}, company_name={s.company_name}")
                    db.delete(s)
                
                # Log the kept settings
                kept = sorted_settings[0]
                logger.info(f"Kept settings record id={kept.id}, company_name={kept.company_name}")
                
                db.commit()
                logger.info(f"Cleanup complete for user {user.id}")
            else:
                logger.info(f"User {user.id} ({user.email}) has {len(settings)} settings record(s). No cleanup needed.")
        
        logger.info("Settings cleanup completed successfully.")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error cleaning settings: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Starting settings cleanup...")
    clean_settings()
    logger.info("Settings cleanup completed.")
