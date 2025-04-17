import os
import importlib
import logging
from pathlib import Path
from sqlalchemy import create_engine, Column, Integer, String, MetaData, Table, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from app.database import SQLALCHEMY_DATABASE_URL, engine, SessionLocal
from app.version import get_version, update_version

logger = logging.getLogger(__name__)

# Create a table to track migrations if it doesn't exist
def ensure_migration_table():
    """Ensure the migration tracking table exists"""
    metadata = MetaData()
    
    # Check if the migration table exists
    inspector = inspect(engine)
    if not inspector.has_table("migrations"):
        # Create migrations table
        migrations = Table(
            "migrations",
            metadata,
            Column("id", Integer, primary_key=True),
            Column("version", Integer, nullable=False),
            Column("name", String, nullable=False),
            Column("applied_at", String, nullable=False)
        )
        metadata.create_all(engine)
        logger.info("Created migrations tracking table")

def get_applied_migrations():
    """Get list of already applied migrations"""
    ensure_migration_table()
    
    db = SessionLocal()
    try:
        # Query the migrations table
        result = db.execute("SELECT version, name FROM migrations ORDER BY version")
        return {row[0]: row[1] for row in result}
    finally:
        db.close()

def record_migration(version, name):
    """Record that a migration has been applied"""
    db = SessionLocal()
    try:
        # Use current timestamp for applied_at
        now = datetime.now().isoformat()
        db.execute(
            "INSERT INTO migrations (version, name, applied_at) VALUES (:version, :name, :applied_at)",
            {"version": version, "name": name, "applied_at": now}
        )
        db.commit()
    finally:
        db.close()

def run_migrations():
    """Run all pending migrations"""
    # Get current DB schema version
    current_version = get_version()["db_schema_version"]
    
    # Get already applied migrations
    applied = get_applied_migrations()
    
    # Get all migration files
    migrations_dir = Path(__file__).parent.parent / "migrations"
    migration_files = []
    
    for item in os.listdir(migrations_dir):
        if item.endswith(".py") and item != "__init__.py":
            # Extract version number from filename (e.g., v002_add_language.py -> 2)
            if item.startswith("v"):
                try:
                    version_str = item.split("_")[0][1:]  # Extract "002" from "v002"
                    version = int(version_str)
                    migration_files.append((version, item))
                except (IndexError, ValueError):
                    logger.warning(f"Skipping migration file with invalid format: {item}")
    
    # Sort migrations by version
    migration_files.sort()
    
    # Run pending migrations
    highest_version = current_version
    for version, filename in migration_files:
        if version > current_version and version not in applied:
            module_name = filename[:-3]  # Remove .py extension
            logger.info(f"Running migration: {module_name} (version {version})")
            
            try:
                # Import and run the migration
                module_path = f"migrations.{module_name}"
                migration_module = importlib.import_module(module_path)
                
                if hasattr(migration_module, "run_migration"):
                    migration_module.run_migration()
                    record_migration(version, module_name)
                    highest_version = max(highest_version, version)
                    logger.info(f"Migration {module_name} completed successfully")
                else:
                    logger.error(f"Migration {module_name} has no run_migration function")
            except Exception as e:
                logger.error(f"Error running migration {module_name}: {e}")
                raise
    
    # Update the DB schema version if needed
    if highest_version > current_version:
        update_version(db_schema_version=highest_version)
        logger.info(f"Updated DB schema version to {highest_version}")
    
    return highest_version
