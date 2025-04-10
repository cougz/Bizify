from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Get database URL from environment variable or use default
# Use localhost for local development and postgres for Docker
DEFAULT_DB_URL = "postgresql://bizify:bizify_password@localhost:5432/bizify"
DOCKER_DB_URL = "postgresql://bizify:bizify_password@postgres:5432/bizify"

# Determine which connection string to use
# If DOCKER_ENV is set, use the Docker connection string
DATABASE_URL = os.getenv("DATABASE_URL", 
                         DOCKER_DB_URL if os.getenv("DOCKER_ENV") else DEFAULT_DB_URL)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
