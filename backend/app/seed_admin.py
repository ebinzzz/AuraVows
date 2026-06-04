import asyncio
import sys
import os

# Add the current directory to sys.path so we can import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import db
from app import crud, schemas

async def seed_admin():
    print("Seeding admin user...")
    await db.connect()
    
    async with db.pool.acquire() as conn:
        admin = await crud.get_user_by_username(conn, "admin")
        if not admin:
            await crud.create_user(conn, schemas.UserCreate(
                username="admin",
                password="adminpassword",
                role="admin"
            ))
            print("Admin user created successfully.")
            print("Username: admin")
            print("Password: adminpassword")
        else:
            print("Admin user already exists.")
            
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(seed_admin())
