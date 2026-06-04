import asyncio
import asyncpg
import os

async def run():
    try:
        conn = await asyncpg.connect('postgresql://postgres:ebin123@172.19.238.72:5432/alsi')
        
        # Create templates table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS templates (
                id UUID PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(50), -- Christian, Hindu, Muslim, etc.
                config JSONB NOT NULL,
                is_system BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        
        # Add template_id to invitations if we want to link them to specific custom templates
        # Actually, let's just keep the 'template' field as a name or ID string.
        
        print("Templates table created successfully")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(run())
