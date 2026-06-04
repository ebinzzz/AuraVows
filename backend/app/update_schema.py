import asyncio
import asyncpg
import os

async def run():
    try:
        conn = await asyncpg.connect('postgresql://postgres:ebin123@172.19.238.72:5432/alsi')
        await conn.execute('ALTER TABLE invitations ADD COLUMN IF NOT EXISTS template VARCHAR(50) DEFAULT \'classic\';')
        await conn.execute('ALTER TABLE invitations ADD COLUMN IF NOT EXISTS share_token VARCHAR(100);')
        print("Schema updated successfully")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(run())
