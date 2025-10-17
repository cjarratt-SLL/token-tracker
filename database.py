import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.engine.url import make_url

# ------------------------------------------------------
# Load environment variables
# ------------------------------------------------------
load_dotenv()

# Get your Supabase database URL
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL not found in .env file")

# Ensure SSL mode
url = make_url(DATABASE_URL)
url = url.set(query={"sslmode": "require"})

# Create SQLAlchemy engine
engine = create_engine(url, echo=False)

def get_session():
    with Session(engine) as session:
        yield session

def init_db():
    import models
    SQLModel.metadata.create_all(engine)
    print("✅ Database initialized successfully (Supabase).")
