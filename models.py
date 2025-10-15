# models.py
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel, field_validator

# -------------------------
# Database models
# -------------------------
class Resident(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str
    last_name: str
    display_name: str
    token_balance: int = 0

class Goal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    points: int = 1
    active: bool = True

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    resident_id: int = Field(foreign_key="resident.id")
    goal_id: Optional[int] = Field(default=None, foreign_key="goal.id")
    points: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    staff_name: Optional[str] = None
    note: Optional[str] = None


# -------------------------
# Pydantic models for API
# -------------------------
class ResidentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    display_name: Optional[str] = None
    token_balance: Optional[int] = None

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    points: Optional[int] = None
    active: Optional[bool] = None

class TransactionCreate(BaseModel):
    resident_id: int
    goal_id: Optional[int] = None
    points: int
    timestamp: Optional[datetime] = None
    staff_name: Optional[str] = None
    note: Optional[str] = None

    @field_validator("timestamp", mode="before")
    @classmethod
    def ensure_utc(cls, v):
        """
        Ensure the timestamp is parsed and stored as UTC.
        Accepts:
          - None → current UTC time
          - str (ISO 8601, with or without 'Z')
          - datetime → will be converted to UTC if naive or non-UTC
        """
        if v is None:
            return datetime.now(timezone.utc)

        # Handle datetime directly
        if isinstance(v, datetime):
            return v.astimezone(timezone.utc) if v.tzinfo else v.replace(tzinfo=timezone.utc)

        # Handle strings (ISO 8601, possibly ending with 'Z')
        if isinstance(v, str):
            s = v.strip()
            if s.endswith("Z"):
                s = s[:-1] + "+00:00"
            try:
                dt = datetime.fromisoformat(s)
            except Exception as exc:
                raise ValueError(
                    "timestamp must be ISO 8601 (e.g. 2025-10-14T15:37:41Z)"
                ) from exc
            return dt.astimezone(timezone.utc) if dt.tzinfo else dt.replace(tzinfo=timezone.utc)

        raise ValueError("Invalid timestamp type; must be None, str, or datetime")

class TransactionRead(BaseModel):
    id: int
    resident_id: int
    goal_id: Optional[int]
    points: int
    timestamp: datetime
    staff_name: Optional[str]
    note: Optional[str]

    model_config = {"from_attributes": True}  # Pydantic V2 compatible

class TransactionUpdate(BaseModel):
    resident_id: Optional[int] = None
    goal_id: Optional[int] = None
    points: Optional[int] = None
    timestamp: Optional[datetime] = None
    staff_name: Optional[str] = None
    note: Optional[str] = None

    @field_validator("timestamp", mode="before")
    @classmethod
    def ensure_utc(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            v = datetime.fromisoformat(v.replace("Z", "+00:00"))
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)