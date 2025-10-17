from fastapi import FastAPI, Depends, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
from datetime import timezone
from datetime import datetime, timezone
from fastapi import Body
from contextlib import asynccontextmanager
from database import get_session, init_db
from models import (Resident, Goal, Transaction, TransactionCreate, TransactionRead, ResidentUpdate, GoalUpdate, TransactionUpdate)

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
@app.post("/resident/", response_model=Resident, summary="Create a new resident")
def create_resident(resident: Resident, session: Session = Depends(get_session)):
    session.add(resident)
    session.commit()
    session.refresh(resident)
    return resident

@app.get("/resident/", response_model=List[Resident], summary="List all residents")
def list_residents(session: Session = Depends(get_session)):
    residents = session.exec(select(Resident)).all()
    return residents

# ------------------------------
# Resident Update/Delete Endpoints
# ------------------------------


@app.put("/resident/{resident_id}", response_model=Resident, summary="Update a resident (partial)")
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


@app.delete("/resident/{resident_id}", summary="Delete a resident")
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
@app.post("/goal/", response_model=Goal, summary="Create a new goal")
def create_goal(goal: Goal, session: Session = Depends(get_session)):
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal

@app.get("/goal/", response_model=List[Goal], summary="List all goals")
def list_goals(session: Session = Depends(get_session)):
    goals = session.exec(select(Goal)).all()
    return goals

# ------------------------------
# Goal Update/Delete endpoints
# ------------------------------
@app.put("/goal/{goal_id}", response_model=Goal, summary="Update a goal (partial)")
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

@app.delete("/goal/{goal_id}", summary="Delete a goal")
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
@app.post("/transaction/", response_model=TransactionRead, summary="Create a new transaction")
def create_transaction(
    transaction_in: TransactionCreate = Body(...),
    session: Session = Depends(get_session),
):
    """
    Create a new transaction (award or deduct tokens) and update the resident's balance.

    Rules:
    - resident_id must exist.
    - goal_id is optional; if provided, it must exist.
    - timestamp is optional; if omitted, it is set to current UTC with 'Z'.
    - All timestamps are stored/returned in UTC.
    - If goal_id is provided:
        * Points default to goal.points
        * If a custom value is used, mark override_points=True
    """
    # 1) Validate resident
    resident = session.get(Resident, transaction_in.resident_id)
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")

    # 2) Validate goal (shared goals are allowed: goal.resident_id may be NULL)
    goal_obj = None
    override = False
    if transaction_in.goal_id is not None:
        goal_obj = session.get(Goal, transaction_in.goal_id)
        if not goal_obj:
            raise HTTPException(status_code=404, detail="Goal not found")

        # Compare provided points with goal default
        if transaction_in.points != goal_obj.points:
            override = True
        else:
            transaction_in.points = goal_obj.points

    # 3) Normalize timestamp to UTC ('Z')
    if transaction_in.timestamp is None:
        ts_utc = datetime.now(timezone.utc)
    else:
        ts_utc = (
            transaction_in.timestamp.replace(tzinfo=timezone.utc)
            if transaction_in.timestamp.tzinfo is None
            else transaction_in.timestamp.astimezone(timezone.utc)
        )

    # 4) Build transaction
    tx = Transaction(
        resident_id=transaction_in.resident_id,
        goal_id=transaction_in.goal_id,
        points=transaction_in.points,
        timestamp=ts_utc,
        staff_name=transaction_in.staff_name,
        note=transaction_in.note,
        override_points=override,
    )

    # 5) Apply points to resident balance
    resident.token_balance = (resident.token_balance or 0) + tx.points

    # 6) Commit atomically
    session.add_all([tx, resident])
    session.commit()
    session.refresh(tx)

    # 7) Optionally include goal title in response
    response_data = {
        "id": tx.id,
        "resident_id": tx.resident_id,
        "goal_id": tx.goal_id,
        "goal_title": goal_obj.title if goal_obj else None,
        "points": tx.points,
        "override_points": tx.override_points,
        "timestamp": tx.timestamp,
        "staff_name": tx.staff_name,
        "note": tx.note,
    }
    return response_data

@app.get("/transaction/", response_model=List[TransactionRead], summary="List all transactions")
def list_transactions(session: Session = Depends(get_session)):
    transactions = session.exec(select(Transaction)).all()
    result = []

    for tx in transactions:
        # Ensure timestamps are UTC
        if tx.timestamp.tzinfo is None:
            tx.timestamp = tx.timestamp.replace(tzinfo=timezone.utc)
        else:
            tx.timestamp = tx.timestamp.astimezone(timezone.utc)

        # Fetch goal title (if goal_id exists)
        goal_title = None
        if tx.goal_id:
            goal = session.get(Goal, tx.goal_id)
            goal_title = goal.title if goal else None

        # Append with goal title and override flag
        resident = session.get(Resident, tx.resident_id)

        tx_data = TransactionRead(
            id=tx.id,
            resident_id=tx.resident_id,
            resident_display_name=resident.display_name if resident else None,
            goal_id=tx.goal_id,
            goal_title=goal_title,
            points=tx.points,
            override_points=tx.override_points,
            timestamp=tx.timestamp,
            staff_name=tx.staff_name,
            note=tx.note,
        )
        result.append(tx_data)

    return result

@app.get(
    "/transaction/resident/{resident_id}",
    response_model=List[TransactionRead],
    summary="List transactions for a specific resident",
)
def transactions_for_resident(resident_id: int, session: Session = Depends(get_session)):
    """
    List all transactions for a resident, with UTC timestamps,
    goal titles, override flags, and resident display name.
    """
    transactions = session.exec(
        select(Transaction).where(Transaction.resident_id == resident_id)
    ).all()

    result = []
    resident = session.get(Resident, resident_id)  # ✅ lookup once per resident

    for tx in transactions:
        # Ensure timestamp is UTC
        if tx.timestamp.tzinfo is None:
            tx.timestamp = tx.timestamp.replace(tzinfo=timezone.utc)
        else:
            tx.timestamp = tx.timestamp.astimezone(timezone.utc)

        # Fetch goal title if applicable
        goal_title = None
        if tx.goal_id:
            goal = session.get(Goal, tx.goal_id)
            goal_title = goal.title if goal else None

        # Build response model
        tx_data = TransactionRead(
            id=tx.id,
            resident_id=tx.resident_id,
            resident_display_name=resident.display_name if resident else None,  # ✅ fix here
            goal_id=tx.goal_id,
            goal_title=goal_title,
            points=tx.points,
            override_points=tx.override_points,
            timestamp=tx.timestamp,
            staff_name=tx.staff_name,
            note=tx.note,
        )
        result.append(tx_data)

    return result


# ------------------------------
# Goal Update/Delete endpoints
# ------------------------------

@app.put("/transaction/{transaction_id}", response_model=TransactionRead, summary="Update a transaction (partial)")
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


@app.delete("/transaction/{transaction_id}", summary="Delete a transaction")
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

