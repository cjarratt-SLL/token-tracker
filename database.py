# database.py
from sqlmodel import SQLModel, Session, create_engine

DATABASE_URL = "sqlite:///./database.db"

# Create the database engine
engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    """
    Initialize the database by creating all tables from SQLModel metadata.
    Called automatically on app startup.
    """
    SQLModel.metadata.create_all(engine)

# ✅ Correct FastAPI dependency for a working Session
def get_session():
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()
