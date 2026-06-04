import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

# Get connection details for the postgres database
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

async def create_database():
    new_db_name = "alsi"
    print(f"Connecting to PostgreSQL server at {DB_HOST}...")
    
    try:
        # Connect to the default 'postgres' database
        conn = await asyncpg.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database="postgres"
        )
        
        # Check if database already exists
        exists = await conn.fetchval("SELECT 1 FROM pg_database WHERE datname = $1", new_db_name)
        
        if not exists:
            print(f"Creating database '{new_db_name}'...")
            await conn.execute(f'CREATE DATABASE {new_db_name}')
            print(f"Database '{new_db_name}' created successfully.")
        else:
            print(f"Database '{new_db_name}' already exists.")
            
        await conn.close()
        
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    asyncio.run(create_database())
