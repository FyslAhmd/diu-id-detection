from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pathlib import Path

# Get base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# SQLite database URL - file-based, no external service needed
SQLALCHEMY_DATABASE_URL = f"sqlite:///{BASE_DIR}/detection_records.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    from . import db_models  # Import models to register them
    Base.metadata.create_all(bind=engine)
