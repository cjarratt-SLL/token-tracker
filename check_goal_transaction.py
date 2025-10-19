from backend.database import engine
from sqlalchemy import text

def show_columns(table):
    print(f"\n🔍 Checking columns for table: {table}\n")
    with engine.connect() as conn:
        result = conn.execute(text(f"""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = '{table}'
            ORDER BY ordinal_position;
        """))
        for row in result:
            print(f"{row.column_name:<20} {row.data_type}")

for t in ("goal", "transaction"):
    show_columns(t)
