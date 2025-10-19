from backend.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("🔍 Checking columns for table: resident\n")
    result = conn.execute(text("""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'resident'
        ORDER BY ordinal_position;
    """))
    for row in result:
        print(f"{row.column_name:<20} {row.data_type}")
