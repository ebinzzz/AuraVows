import asyncpg
import uuid
from . import schemas, auth

# User CRUD
async def get_user_by_username(conn: asyncpg.Connection, username: str):
    row = await conn.fetchrow("SELECT * FROM users WHERE username = $1", username)
    return dict(row) if row else None

async def create_user(conn: asyncpg.Connection, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    user_id = uuid.uuid4()
    await conn.execute(
        "INSERT INTO users (id, username, hashed_password, role, invitation_id) VALUES ($1, $2, $3, $4, $5)",
        user_id, user.username, hashed_password, user.role, user.invitation_id
    )
    return await get_user_by_username(conn, user.username)

# Invitation CRUD
async def get_invitations(conn: asyncpg.Connection):
    rows = await conn.fetch("""
        SELECT i.*, 
        (SELECT COUNT(*) FROM rsvps WHERE invitation_id = i.invitation_id) as total_rsvps,
        (SELECT COALESCE(SUM(guest_count), 0) FROM rsvps WHERE invitation_id = i.invitation_id AND attending = true) as total_guests
        FROM invitations i
        ORDER BY i.created_at DESC
    """)
    import json
    res = []
    for row in rows:
        d = dict(row)
        if d.get('custom_config') and isinstance(d['custom_config'], str):
            d['custom_config'] = json.loads(d['custom_config'])
        if d.get('gallery_photos') and isinstance(d['gallery_photos'], str):
            d['gallery_photos'] = json.loads(d['gallery_photos'])
        if d.get('event_timeline') and isinstance(d['event_timeline'], str):
            d['event_timeline'] = json.loads(d['event_timeline'])
        if d.get('after_marriage_photos') and isinstance(d['after_marriage_photos'], str):
            d['after_marriage_photos'] = json.loads(d['after_marriage_photos'])
        res.append(d)
    return res

async def get_invitation_by_code(conn: asyncpg.Connection, invitation_id: str):
    row = await conn.fetchrow("SELECT * FROM invitations WHERE invitation_id = $1", invitation_id)
    if not row: return None
    import json
    d = dict(row)
    if d.get('custom_config') and isinstance(d['custom_config'], str):
        d['custom_config'] = json.loads(d['custom_config'])
    if d.get('gallery_photos') and isinstance(d['gallery_photos'], str):
        d['gallery_photos'] = json.loads(d['gallery_photos'])
    if d.get('event_timeline') and isinstance(d['event_timeline'], str):
        d['event_timeline'] = json.loads(d['event_timeline'])
    if d.get('after_marriage_photos') and isinstance(d['after_marriage_photos'], str):
        d['after_marriage_photos'] = json.loads(d['after_marriage_photos'])
    return d

async def create_invitation(conn: asyncpg.Connection, invitation: schemas.InvitationCreate):
    invitation_id_uuid = uuid.uuid4()
    # Convert model to dict for SQL
    data = invitation.model_dump()
    
    if not data.get('share_token'):
        data['share_token'] = uuid.uuid4().hex[:12]
        
    # Handle JSON custom_config
    import json
    if data.get('custom_config') is not None:
        data['custom_config'] = json.dumps(data['custom_config'])
    if data.get('gallery_photos') is not None:
        data['gallery_photos'] = json.dumps(data['gallery_photos'])
    if data.get('event_timeline') is not None:
        data['event_timeline'] = json.dumps(data['event_timeline'])
    if data.get('after_marriage_photos') is not None:
        data['after_marriage_photos'] = json.dumps(data['after_marriage_photos'])
        
    columns = list(data.keys())
    values = [data[col] for col in columns]
    
    # Add UUID and invitation_id business code if not in data (it should be in data based on schema)
    # The schema.sql uses invitation_id as business code.
    
    query = f"INSERT INTO invitations (id, {', '.join(columns)}) VALUES ($1, {', '.join([f'${i+2}' for i in range(len(values))])})"
    await conn.execute(query, invitation_id_uuid, *values)
    
    # Return the created invitation
    row = await conn.fetchrow("SELECT * FROM invitations WHERE id = $1", invitation_id_uuid)
    if not row: return None
    
    import json
    d = dict(row)
    if d.get('custom_config') and isinstance(d['custom_config'], str):
        d['custom_config'] = json.loads(d['custom_config'])
    if d.get('gallery_photos') and isinstance(d['gallery_photos'], str):
        d['gallery_photos'] = json.loads(d['gallery_photos'])
    if d.get('event_timeline') and isinstance(d['event_timeline'], str):
        d['event_timeline'] = json.loads(d['event_timeline'])
    if d.get('after_marriage_photos') and isinstance(d['after_marriage_photos'], str):
        d['after_marriage_photos'] = json.loads(d['after_marriage_photos'])
    return d
    
async def update_invitation(conn: asyncpg.Connection, invitation_id: str, invitation: schemas.InvitationUpdate):
    # Convert model to dict and filter out None values
    data = invitation.model_dump(exclude_unset=True)
    
    # If share_token is requested to be generated or is missing in the DB
    # We can check the existing record
    existing = await get_invitation_by_code(conn, invitation_id)
    if existing and not existing.get('share_token') and not data.get('share_token'):
        data['share_token'] = uuid.uuid4().hex[:12]

    # Handle JSON custom_config
    import json
    if 'custom_config' in data and data['custom_config'] is not None:
        data['custom_config'] = json.dumps(data['custom_config'])
    if 'gallery_photos' in data and data['gallery_photos'] is not None:
        data['gallery_photos'] = json.dumps(data['gallery_photos'])
    if 'event_timeline' in data and data['event_timeline'] is not None:
        data['event_timeline'] = json.dumps(data['event_timeline'])
    if 'after_marriage_photos' in data and data['after_marriage_photos'] is not None:
        data['after_marriage_photos'] = json.dumps(data['after_marriage_photos'])

    if not data:
        return await get_invitation_by_code(conn, invitation_id)
    
    columns = list(data.keys())
    values = [data[col] for col in columns]
    
    set_clause = ", ".join([f"{col} = ${i+2}" for i, col in enumerate(columns)])
    query = f"UPDATE invitations SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE invitation_id = $1"
    
    await conn.execute(query, invitation_id, *values)
    return await get_invitation_by_code(conn, invitation_id)

async def delete_invitation(conn: asyncpg.Connection, invitation_id: str):
    await conn.execute("DELETE FROM invitations WHERE invitation_id = $1", invitation_id)
    return True

# Family Note CRUD
async def create_family_note(conn: asyncpg.Connection, note: schemas.FamilyNoteCreate, invitation_id: str):
    note_id = uuid.uuid4()
    data = note.model_dump()
    columns = list(data.keys())
    values = [data[col] for col in columns]
    
    query = f"INSERT INTO family_notes (id, invitation_id, {', '.join(columns)}) VALUES ($1, $2, {', '.join([f'${i+3}' for i in range(len(values))])})"
    await conn.execute(query, note_id, invitation_id, *values)
    
    row = await conn.fetchrow("SELECT * FROM family_notes WHERE id = $1", note_id)
    return dict(row) if row else None

async def get_family_notes(conn: asyncpg.Connection, invitation_id: str):
    rows = await conn.fetch("SELECT * FROM family_notes WHERE invitation_id = $1 ORDER BY display_order", invitation_id)
    return [dict(row) for row in rows]

# RSVP CRUD
async def create_rsvp(conn: asyncpg.Connection, rsvp: schemas.RSVPCreate, invitation_id: str):
    rsvp_id = uuid.uuid4()
    data = rsvp.model_dump()
    columns = list(data.keys())
    values = [data[col] for col in columns]
    
    query = f"INSERT INTO rsvps (id, invitation_id, {', '.join(columns)}) VALUES ($1, $2, {', '.join([f'${i+3}' for i in range(len(values))])})"
    await conn.execute(query, rsvp_id, invitation_id, *values)
    
    row = await conn.fetchrow("SELECT * FROM rsvps WHERE id = $1", rsvp_id)
    return dict(row) if row else None

async def get_rsvps(conn: asyncpg.Connection, invitation_id: str):
    rows = await conn.fetch("SELECT * FROM rsvps WHERE invitation_id = $1 ORDER BY response_date DESC", invitation_id)
    return [dict(row) for row in rows]

# Template CRUD
async def create_template(conn: asyncpg.Connection, template: schemas.TemplateCreate):
    template_id = uuid.uuid4()
    data = template.model_dump()
    columns = list(data.keys())
    values = [data[col] for col in columns]
    
    # Handle JSON config
    import json
    for i, col in enumerate(columns):
        if col == 'config':
            values[i] = json.dumps(values[i])
            
    query = f"INSERT INTO templates (id, {', '.join(columns)}) VALUES ($1, {', '.join([f'${i+2}' for i in range(len(values))])})"
    await conn.execute(query, template_id, *values)
    
    row = await conn.fetchrow("SELECT * FROM templates WHERE id = $1", template_id)
    if not row: return None
    import json
    d = dict(row)
    if isinstance(d['config'], str):
        d['config'] = json.loads(d['config'])
    return d

async def get_templates(conn: asyncpg.Connection):
    rows = await conn.fetch("SELECT * FROM templates ORDER BY created_at DESC")
    import json
    res = []
    for row in rows:
        d = dict(row)
        if isinstance(d['config'], str):
            d['config'] = json.loads(d['config'])
        res.append(d)
    return res

async def get_template_by_id(conn: asyncpg.Connection, template_id: uuid.UUID):
    row = await conn.fetchrow("SELECT * FROM templates WHERE id = $1", template_id)
    if not row: return None
    import json
    d = dict(row)
    if isinstance(d['config'], str):
        d['config'] = json.loads(d['config'])
    return d

async def update_template(conn: asyncpg.Connection, template_id: uuid.UUID, template: schemas.TemplateUpdate):
    data = template.model_dump(exclude_unset=True)
    
    import json
    if 'config' in data and data['config'] is not None:
        data['config'] = json.dumps(data['config'])
        
    if not data:
        return await get_template_by_id(conn, template_id)
        
    columns = list(data.keys())
    values = [data[col] for col in columns]
    
    set_clause = ", ".join([f"{col} = ${i+2}" for i, col in enumerate(columns)])
    query = f"UPDATE templates SET {set_clause} WHERE id = $1"
    
    await conn.execute(query, template_id, *values)
    return await get_template_by_id(conn, template_id)
