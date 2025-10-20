from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import Body, Depends, FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from database import get_session, init_db
from models import Resident, Goal, Transaction

# ----------------------------------------
# App + lifespan
# ----------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # Create tables on startup
    yield
    # Optional cleanup logic here


app = FastAPI(title="Token Tracker API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://sll-resident-token-hub.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------
# Resident endpoints
# ----------------------------------------
@app.post("/resident/", response_model=Resident, summary="Create a new resident")
def create_resident(resident: Resident, session: Session = Depends(get_session)):
    session.add(resident)
    session.commit()
    session.refresh(resident)
    return resident


@app.get("/resident/", response_model=List[Resident], summary="List all residents")
def list_residents(session: Session = Depends(get_session)):
    return session.exec(select(Resident)).all()


@app.put("/resident/{resident_id}", response_model=Resident, summary="Update a resident")
def update_resident(
    resident_id: int,
    updated_data: Resident,
    session: Session = Depends(get_session),
):
    resident = session.get(Resident, resident_id)
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")

    update_fields = updated_data.dict(exclude_unset=True)
    for key, value in update_fields.items():
        setattr(resident, key, value)

    session.add(resident)
    session.commit()
    session.refresh(resident)
    return resident


@app.delete("/resident/{resident_id}", summary="Delete a resident")
def delete_resident(
    resident_id: int = Path(..., description="ID of the resident to delete"),
    session: Session = Depends(get_session),
):
    resident = session.get(Resident, resident_id)
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")

    session.delete(resident)
    session.commit()
    return {"message": f"Resident with ID {resident_id} deleted successfully"}

# ----------------------------------------
# Goal endpoints
# ----------------------------------------
@app.post("/goal/", response_model=Goal, summary="Create a new goal")
def create_goal(goal: Goal, session: Session = Depends(get_session)):
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal


@app.get("/goal/", response_model=List[Goal], summary="List all goals")
def list_goals(session: Session = Depends(get_session)):
    return session.exec(select(Goal)).all()


@app.put("/goal/{goal_id}", response_model=Goal, summary="Update a goal")
def update_goal(goal_id: int, updated_data: Goal, session: Session = Depends(get_session)):
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_fields = updated_data.dict(exclude_unset=True)
    for key, value in update_fields.items():
        setattr(goal, key, value)

    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal


@app.delete("/goal/{goal_id}", summary="Delete a goal")
def delete_goal(goal_id: int, session: Session = Depends(get_session)):
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    session.delete(goal)
    session.commit()
    return {"detail": "Goal deleted successfully"}

# ----------------------------------------
# Transaction endpoints
# ----------------------------------------
@app.post("/transaction/", response_model=Transaction, summary="Create a new transaction and update resident balance")
def create_transaction(transaction: Transaction, session: Session = Depends(get_session)):
    try:
        # 1️⃣ Fetch the related Resident and Goal
        resident = session.get(Resident, transaction.resident_id)
        if not resident:
            raise HTTPException(status_code=404, detail="Resident not found")

        goal = session.get(Goal, transaction.goal_id)
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")

        # 2️⃣ Determine points value
        # Use the goal’s default points if not provided in the transaction
        points_value = transaction.points if transaction.points is not None else goal.points

        # 3️⃣ Create a new Transaction record
        db_transaction = Transaction(
            resident_id=transaction.resident_id,
            goal_id=transaction.goal_id,
            staff_name=transaction.staff_name,  # ✅ include staff name
            points=points_value,
            note=getattr(transaction, "note", None)  # optional field
        )

        # 4️⃣ Update the resident’s token balance
        resident.token_balance += points_value

        # 5️⃣ Save both updates atomically
        session.add_all([db_transaction, resident])
        session.commit()

        # 6️⃣ Refresh and return the transaction
        session.refresh(db_transaction)
        return db_transaction

    except Exception as e:
        # 🔒 Roll back any partial changes if an error occurs
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Transaction failed and rolled back: {str(e)}"
        )






@app.get("/transaction/", response_model=List[Transaction], summary="List all transactions")
def list_transactions(session: Session = Depends(get_session)):
    return session.exec(select(Transaction)).all()


@app.get(
    "/transaction/resident/{resident_id}",
    response_model=List[Transaction],
    summary="List transactions for a specific resident",
)
def transactions_for_resident(resident_id: int, session: Session = Depends(get_session)):
    return session.exec(select(Transaction).where(Transaction.resident_id == resident_id)).all()

# ----------------------------------------
# Health
# ----------------------------------------
@app.get("/", summary="API status check")
def read_root():
    return {"message": "Token Tracker API is running!"}
