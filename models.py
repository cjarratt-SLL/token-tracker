# models.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel, field_validator


# -------------------------
# Database models
# -------------------------
class Resident(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str
    last_name: str
    display_name: Optional[str] = None
    token_balance: int = Field(default=0)

    # Relationships
    goals: List["Goal"] = Relationship(back_populates="resident")
    transactions: List["Transaction"] = Relationship(back_populates="resident")


class Goal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    points: int
    active: bool = Field(default=True)
    resident_id: Optional[int] = Field(default=None, foreign_key="resident.id")

    # Relationships
    resident: Optional["Resident"] = Relationship(back_populates="goals")
    transactions: List["Transaction"] = Relationship(back_populates="goal")


class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    resident_id: int = Field(foreign_key="resident.id")
    goal_id: Optional[int] = Field(default=None, foreign_key="goal.id")
    points: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    staff_name: Optional[str] = None
    note: Optional[str] = None
    override_points: bool = Field(default=False)  # ✅ new flag

    # Relationships
    resident: "Resident" = Relationship(back_populates="transactions")
    goal: Optional["Goal"] = Relationship(back_populates="transactions")


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
        if v is None:
            return datetime.now(timezone.utc)
        if isinstance(v, datetime):
            return v.astimezone(timezone.utc) if v.tzinfo else v.replace(tzinfo=timezone.utc)
        if isinstance(v, str):
            s = v.strip().replace("Z", "+00:00")
            dt = datetime.fromisoformat(s)
            return dt.astimezone(timezone.utc) if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        raise ValueError("Invalid timestamp type; must be None, str, or datetime")


class TransactionRead(BaseModel):
    id: int
    resident_id: int
    resident_display_name: Optional[str] = None
    goal_id: Optional[int]
    goal_title: Optional[str] = None   # ✅ show goal title in API response
    points: int
    override_points: Optional[bool] = False   # ✅ indicate if manual override happened
    timestamp: datetime
    staff_name: Optional[str]
    note: Optional[str]

    model_config = {"from_attributes": True}



class TransactionUpdate(BaseModel):
    resident_id: Optional[int] = None
    goal_id: Optional[int] = None
    points: Optional[int] = None
    override_points: Optional[bool] = None   # ✅ added so staff can toggle it if needed
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
