from sqlalchemy import create_engine, Column, String, MetaData, Table
from app.database import SQLALCHEMY_DATABASE_URL

def run_migration():
    """
    Add bank details columns to the settings table
    """
    print("Running migration: add_bank_details.py")
    
    # Create engine and connect to the database
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    conn = engine.connect()
    
    # Create metadata object
    metadata = MetaData()
    metadata.reflect(bind=engine)
    
    # Get the settings table
    settings_table = metadata.tables['settings']
    
    # Check if the columns already exist
    existing_columns = [c.name for c in settings_table.columns]
    
    # Add bank_name column if it doesn't exist
    if 'bank_name' not in existing_columns:
        print("Adding bank_name column to settings table")
        conn.execute('ALTER TABLE settings ADD COLUMN bank_name VARCHAR')
    
    # Add bank_iban column if it doesn't exist
    if 'bank_iban' not in existing_columns:
        print("Adding bank_iban column to settings table")
        conn.execute('ALTER TABLE settings ADD COLUMN bank_iban VARCHAR')
    
    # Add bank_bic column if it doesn't exist
    if 'bank_bic' not in existing_columns:
        print("Adding bank_bic column to settings table")
        conn.execute('ALTER TABLE settings ADD COLUMN bank_bic VARCHAR')
    
    # Close the connection
    conn.close()
    
    print("Migration completed successfully")

if __name__ == "__main__":
    run_migration()
