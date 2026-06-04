import asyncio
import sys
import os

# Add the current directory to sys.path so we can import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import db

async def init_db():
    print("Initializing database with raw SQL...")
    await db.connect()
    
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, "r") as f:
        schema_sql = f.read()
        
    async with db.pool.acquire() as conn:
        await conn.execute(schema_sql)
        print("Database tables created successfully.")
        
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(init_db())
