"""
Backend package for the Token Tracker project.

This package contains:
- database.py: Database engine and session helpers
- models.py: SQLModel data models and Pydantic schemas
- main.py: FastAPI app entry point

Import conventions:
    from backend.models import Resident
    from backend.database import get_session
"""

"""
Backend package for the Token Tracker project.
"""

from . import database
from . import models
from . import main

__all__ = ["database", "models", "main"]

