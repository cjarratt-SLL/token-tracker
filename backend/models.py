from __future__ import annotations
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import Mapped
from datetime import datetime, timezone


# ==========================================================
# Resident
# ==========================================================
class Resident(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str
    last_name: str
    display_name: Optional[str] = None
    token_balance: int = 0


# ==========================================================
# Goal
# ==========================================================
class Goal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    points: int
    active: bool = True
    resident_id: Optional[int] = Field(default=None, foreign_key="resident.id")


# ==========================================================
# Transaction
# ==========================================================
class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    resident_id: int = Field(foreign_key="resident.id")
    goal_id: int = Field(foreign_key="goal.id")
    points: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    staff_name: str
    note: Optional[str] = None
    override_points: bool = False


# ==========================================================
# Relationships (declared after class definitions)
# ==========================================================
Resident.goals: Mapped[list[Goal]] = Relationship(  # type: ignore
    back_populates="resident",
    sa_relationship_kwargs={"cascade": "all, delete-orphan"},
)
Resident.transactions: Mapped[list[Transaction]] = Relationship(  # type: ignore
    back_populates="resident",
    sa_relationship_kwargs={"cascade": "all, delete-orphan"},
)

Goal.resident: Mapped[Resident] = Relationship(back_populates="goals")  # type: ignore
Goal.transactions: Mapped[list[Transaction]] = Relationship(back_populates="goal")  # type: ignore

Transaction.resident: Mapped[Resident] = Relationship(back_populates="transactions")  # type: ignore
Transaction.goal: Mapped[Goal] = Relationship(back_populates="transactions")  # type: ignore
