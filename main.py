from fastapi import FastAPI, Depends, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
from datetime import timezone
from contextlib import asynccontextmanager
from database import get_session, init_db
from models import (Resident, Goal, Transaction, TransactionCreate, TransactionRead,ResidentUpdate, GoalUpdate, TransactionUpdate
)

# ------------------------------
# Proper FastAPI + CORS setup
# ------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # Create tables on startup
    yield
    # Optional: cleanup logic here

# ✅ Create only one FastAPI instance
app = FastAPI(title="Token Tracker API", lifespan=lifespan)

# ✅ Apply CORS to the same app instance
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# (Continue with your endpoints below)


# ------------------------------
# Resident endpoints
# ------------------------------
@app.post("/residents/", response_model=Resident, summary="Create a new resident")
def create_resident(resident: Resident, session: Session = Depends(get_session)):
    session.add(resident)
    session.commit()
    session.refresh(resident)
    return resident

@app.get("/residents/", response_model=List[Resident], summary="List all residents")
def list_residents(session: Session = Depends(get_session)):
    residents = session.exec(select(Resident)).all()
    return residents

# ------------------------------
# Resident Update/Delete Endpoints
# ------------------------------


@app.put("/residents/{resident_id}", response_model=Resident, summary="Update a resident (partial)")
def update_resident(
    resident_id: int,
    updated_data: ResidentUpdate,
    session: Session = Depends(get_session)
):
    resident = session.get(Resident, resident_id)
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")

    update_fields = updated_data.model_dump(exclude_unset=True)
    for key, value in update_fields.items():
        setattr(resident, key, value)

    session.add(resident)
    session.commit()
    session.refresh(resident)
    return resident


@app.delete("/residents/{resident_id}", summary="Delete a resident")
def delete_resident(
    resident_id: int = Path(..., description="ID of the resident to delete"),
    session: Session = Depends(get_session)
):
    resident = session.get(Resident, resident_id)
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")

    session.delete(resident)
    session.commit()
    return {"message": f"Resident with ID {resident_id} deleted successfully"}



# ------------------------------
# Goal endpoints
# ------------------------------
@app.post("/goals/", response_model=Goal, summary="Create a new goal")
def create_goal(goal: Goal, session: Session = Depends(get_session)):
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal

@app.get("/goals/", response_model=List[Goal], summary="List all goals")
def list_goals(session: Session = Depends(get_session)):
    goals = session.exec(select(Goal)).all()
    return goals

# ------------------------------
# Goal Update/Delete endpoints
# ------------------------------
@app.put("/goals/{goal_id}", response_model=Goal, summary="Update a goal (partial)")
def update_goal(
    goal_id: int,
    updated_data: GoalUpdate,
    session: Session = Depends(get_session)
):
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_fields = updated_data.model_dump(exclude_unset=True)
    for key, value in update_fields.items():
        setattr(goal, key, value)

    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal

@app.delete("/goals/{goal_id}", summary="Delete a goal")
def delete_goal(goal_id: int, session: Session = Depends(get_session)):
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    session.delete(goal)
    session.commit()
    return {"detail": "Goal deleted successfully"}
# ------------------------------
# Transaction endpoints
# ------------------------------
@app.post("/transactions/", response_model=TransactionRead, summary="Create a new transaction")
def create_transaction(transaction_in: TransactionCreate, session: Session = Depends(get_session)):
    # Ensure timestamp is always UTC
    if transaction_in.timestamp:
        timestamp_utc = transaction_in.timestamp.astimezone(timezone.utc)
    else:
        from datetime import datetime, timezone
        timestamp_utc = datetime.now(timezone.utc)


    transaction = Transaction(
        resident_id=transaction_in.resident_id,
        goal_id=transaction_in.goal_id,
        points=transaction_in.points,
        timestamp=timestamp_utc,
        staff_name=transaction_in.staff_name,
        note=transaction_in.note,
    )

    # Update resident's token balance
    resident = session.get(Resident, transaction.resident_id)
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
    resident.token_balance += transaction.points

    session.add(transaction)
    session.add(resident)
    session.commit()
    session.refresh(transaction)
    return transaction

@app.get("/transactions/", response_model=List[TransactionRead], summary="List all transactions")
def list_transactions(session: Session = Depends(get_session)):
    transactions = session.exec(select(Transaction)).all()
    # Ensure timestamps are UTC
    for tx in transactions:
        if tx.timestamp.tzinfo is None:
            tx.timestamp = tx.timestamp.replace(tzinfo=timezone.utc)
        else:
            tx.timestamp = tx.timestamp.astimezone(timezone.utc)
    return transactions

@app.get("/transactions/resident/{resident_id}", response_model=List[TransactionRead], summary="List transactions for a resident")
def transactions_for_resident(resident_id: int, session: Session = Depends(get_session)):
    transactions = session.exec(
        select(Transaction).where(Transaction.resident_id == resident_id)
    ).all()
    for tx in transactions:
        if tx.timestamp.tzinfo is None:
            tx.timestamp = tx.timestamp.replace(tzinfo=timezone.utc)
        else:
            tx.timestamp = tx.timestamp.astimezone(timezone.utc)
    return transactions

# ------------------------------
# Goal Update/Delete endpoints
# ------------------------------

@app.put("/transactions/{transaction_id}", response_model=TransactionRead, summary="Update a transaction (partial)")
def update_transaction(
    transaction_id: int,
    updated_data: TransactionUpdate,
    session: Session = Depends(get_session)
):
    transaction = session.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_fields = updated_data.model_dump(exclude_unset=True)
    for key, value in update_fields.items():
        setattr(transaction, key, value)

    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return transaction


@app.delete("/transactions/{transaction_id}", summary="Delete a transaction")
def delete_transaction(transaction_id: int, session: Session = Depends(get_session)):
    transaction = session.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    session.delete(transaction)
    session.commit()
    return {"detail": "Transaction deleted successfully"}

# ------------------------------
# Root endpoint
# ------------------------------
@app.get("/", summary="API status check")
def read_root():
    return {"message": "Token Tracker API with SQLite is running!"}

