from sqlmodel import create_engine, SQLModel, Session
from dotenv import load_dotenv
import os

# ------------------------------------------------------
# Load environment variables
# ------------------------------------------------------
load_dotenv()

# Get your Supabase database URL
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found. Please set it in your .env file.")

# ------------------------------------------------------
# Create the SQLAlchemy engine
# ------------------------------------------------------
# echo=False keeps logs quiet; set to True for debugging
engine = create_engine(DATABASE_URL, echo=False)


# ------------------------------------------------------
# Initialize the database (creates tables if missing)
# ------------------------------------------------------
def init_db():
    SQLModel.metadata.create_all(engine)


# ------------------------------------------------------
# Dependency for FastAPI to get a database session
# ------------------------------------------------------
def get_session():
    with Session(engine) as session:
        yield session
