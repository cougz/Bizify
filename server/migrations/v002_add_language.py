"""
Migration to add language column to settings table
"""
from sqlalchemy import create_engine, MetaData, Table, Column, String
from app.database import SQLALCHEMY_DATABASE_URL

def run_migration():
    """
    Add language column to settings table
    """
    print("Running migration: v002_add_language.py")
    
    # Create engine and connect to the database
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    conn = engine.connect()
    
    # Create metadata object
    metadata = MetaData()
    metadata.reflect(bind=engine)
    
    # Get the settings table
    settings_table = metadata.tables['settings']
    
    # Check if the column already exists
    existing_columns = [c.name for c in settings_table.columns]
    
    # Add language column if it doesn't exist
    if 'language' not in existing_columns:
        print("Adding language column to settings table")
        conn.execute('ALTER TABLE settings ADD COLUMN language VARCHAR DEFAULT "en"')
    
    # Close the connection
    conn.close()
    
    print("Migration completed successfully")
