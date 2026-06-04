import asyncio
import asyncpg

async def update_db():
    try:
        conn = await asyncpg.connect('postgresql://postgres:ebin123@172.19.238.72:5432/alsi')
        
        # Add hero_bg_image, hero_bg_opacity, and custom_config to invitations
        await conn.execute('''
            ALTER TABLE invitations 
            ADD COLUMN IF NOT EXISTS hero_bg_image VARCHAR(500),
            ADD COLUMN IF NOT EXISTS hero_bg_opacity FLOAT DEFAULT 0.5,
            ADD COLUMN IF NOT EXISTS custom_config JSONB;
        ''')
        
        print("Database updated successfully with new columns")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(update_db())
