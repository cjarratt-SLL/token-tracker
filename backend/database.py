from __future__ import annotations
import os
import ssl
from typing import Generator
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.engine.url import make_url
from sqlalchemy.pool import NullPool
import pg8000


# ==========================================================
# 1️⃣  Load environment and build database URL
# ==========================================================
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env file")

# Ensure driver explicitly uses pg8000 (Supabase + IPv4 compatible)
if "pg8000" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://")

# Parse and verify URL
url = make_url(DATABASE_URL)
driver = url.get_backend_name().lower() if url else ""
if driver == "postgresql":
    # SQLAlchemy sometimes strips '+pg8000'
    driver = "pg8000"
print(f"Effective driver: {driver}")


# ==========================================================
# 2️⃣  Prepare SSL and pg8000 connection creator
# ==========================================================
ssl_context = ssl._create_unverified_context()
host = url.host or "aws-1-us-east-2.pooler.supabase.com"
port_val = int(url.port or 5432)
user_val = url.username
password_val = url.password
database_val = url.database


def _pg8000_creator():
    """Create a direct pg8000 connection (bypassing SQLAlchemy’s sslmode)."""
    print(f"Opening pg8000 connection to {host}:{port_val} ...")
    return pg8000.connect(
        host=host,
        port=port_val,
        user=user_val,
        password=password_val,
        database=database_val,
        ssl_context=ssl_context,
    )


# ==========================================================
# 3️⃣  Create SQLAlchemy engine using custom connection
# ==========================================================
engine = create_engine(
    "postgresql+pg8000://",
    creator=_pg8000_creator,
    pool_pre_ping=True,   # ✅ checks connection health before each use
    pool_recycle=1800,    # ✅ recycle connections every 30 min
    echo=False,
)
print("Engine created using custom pg8000 creator.")


# ==========================================================
# 4️⃣  Session management helpers
# ==========================================================
def get_session() -> Generator[Session, None, None]:
    """Provide a session for FastAPI dependency injection."""
    with Session(engine) as session:
        yield session


# ==========================================================
# 5️⃣  Database initialization
# ==========================================================
def init_db() -> None:
    """Initialize tables on startup."""
    print("Initializing database...")
    SQLModel.metadata.create_all(engine)
    print("Database ready.")
