from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
import asyncpg
import shutil
import uuid
from datetime import timedelta
from typing import List, Optional
import os

from . import schemas, crud, auth, database
from .database import db, get_db

app = FastAPI(title="Wedding Invitation API")

# Setup CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if not os.path.exists(static_path):
    os.makedirs(static_path)
uploads_path = os.path.join(static_path, "uploads")
if not os.path.exists(uploads_path):
    os.makedirs(uploads_path)

app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.on_event("startup")
async def startup():
    await db.connect()
    
    # Initialize database tables from schema.sql
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, "r") as f:
        schema_sql = f.read()
    
    async with db.pool.acquire() as conn:
        await conn.execute(schema_sql)
        
        # Create default admin if not exists
        admin = await crud.get_user_by_username(conn, "admin")
        if not admin:
            await crud.create_user(conn, schemas.UserCreate(
                username="admin",
                password="adminpassword",
                role="admin"
            ))

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

# Authentication Endpoints
@app.post("/api/token", response_model=schemas.Token)
async def login_for_access_token(conn: asyncpg.Connection = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = await crud.get_user_by_username(conn, form_data.username)
    if not user or not auth.verify_password(form_data.password, user['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=schemas.User)
async def read_users_me(current_user: dict = Depends(auth.get_current_user)):
    return current_user

# Invitation Endpoints
@app.post("/api/invitations/", response_model=schemas.Invitation)
async def create_invitation(
    invitation: schemas.InvitationCreate, 
    conn: asyncpg.Connection = Depends(get_db),
    admin: dict = Depends(auth.get_current_admin)
):
    return await crud.create_invitation(conn, invitation)

@app.get("/api/invitations/", response_model=List[schemas.Invitation])
async def read_invitations(
    conn: asyncpg.Connection = Depends(get_db),
    admin: dict = Depends(auth.get_current_admin)
):
    return await crud.get_invitations(conn)

@app.get("/api/invitations/{invitation_id}", response_model=schemas.Invitation)
async def read_invitation(
    invitation_id: str, 
    conn: asyncpg.Connection = Depends(get_db),
    current_user: Optional[dict] = Depends(auth.get_current_user_optional)
):
    db_invitation = await crud.get_invitation_by_code(conn, invitation_id)
    if db_invitation is None:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    if not db_invitation.get('is_active', True):
        # Allow admins to view inactive invitations (for editing)
        if current_user and current_user.get('role') == 'admin':
            return db_invitation
        raise HTTPException(status_code=403, detail="This invitation is currently inactive")
    return db_invitation

@app.get("/api/invitations/by-id/{id}", response_model=schemas.Invitation)
async def get_invitation_by_uuid(id: uuid.UUID, conn: asyncpg.Connection = Depends(get_db)):
    row = await conn.fetchrow("SELECT * FROM invitations WHERE id = $1", id)
    if not row:
        raise HTTPException(status_code=404, detail="Invitation not found")
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

@app.put("/api/invitations/{invitation_id}", response_model=schemas.Invitation)
async def update_invitation(
    invitation_id: str,
    invitation: schemas.InvitationUpdate,
    conn: asyncpg.Connection = Depends(get_db),
    admin: dict = Depends(auth.get_current_admin)
):
    db_invitation = await crud.get_invitation_by_code(conn, invitation_id)
    if db_invitation is None:
        raise HTTPException(status_code=404, detail="Invitation not found")
    return await crud.update_invitation(conn, invitation_id, invitation)

@app.delete("/api/invitations/{invitation_id}")
async def delete_invitation(
    invitation_id: str,
    conn: asyncpg.Connection = Depends(get_db),
    admin: dict = Depends(auth.get_current_admin)
):
    db_invitation = await crud.get_invitation_by_code(conn, invitation_id)
    if db_invitation is None:
        raise HTTPException(status_code=404, detail="Invitation not found")
    await crud.delete_invitation(conn, invitation_id)
    return {"message": "Invitation deleted successfully"}

# Family Notes Endpoints
@app.post("/api/invitations/{invitation_id}/notes/", response_model=schemas.FamilyNote)
async def add_family_note(
    invitation_id: str,
    note: schemas.FamilyNoteCreate,
    conn: asyncpg.Connection = Depends(get_db),
    admin: dict = Depends(auth.get_current_admin)
):
    return await crud.create_family_note(conn, note, invitation_id)

@app.get("/api/invitations/{invitation_id}/notes/", response_model=List[schemas.FamilyNote])
async def get_family_notes(invitation_id: str, conn: asyncpg.Connection = Depends(get_db)):
    return await crud.get_family_notes(conn, invitation_id)

# RSVP Endpoints
@app.post("/api/rsvp/{invitation_id}", response_model=schemas.RSVP)
async def submit_rsvp(invitation_id: str, rsvp: schemas.RSVPCreate, conn: asyncpg.Connection = Depends(get_db)):
    db_invitation = await crud.get_invitation_by_code(conn, invitation_id)
    if not db_invitation or not db_invitation.get('is_active', True):
        raise HTTPException(status_code=403, detail="Cannot submit RSVP to an inactive invitation")
    return await crud.create_rsvp(conn, rsvp, invitation_id)

@app.get("/api/rsvp/{invitation_id}/list", response_model=List[schemas.RSVP])
async def list_rsvps(
    invitation_id: str, 
    conn: asyncpg.Connection = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    if current_user['role'] != "admin" and current_user['invitation_id'] != invitation_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these RSVPs")
    return await crud.get_rsvps(conn, invitation_id)

@app.get("/api/rsvp/shared/{share_token}", response_model=schemas.SharedRSVPResponse)
async def list_rsvps_shared(share_token: str, conn: asyncpg.Connection = Depends(get_db)):
    print(f"DEBUG: Shared RSVP lookup for token: {share_token}")
    # Find invitation by share_token
    invitation = await conn.fetchrow("SELECT * FROM invitations WHERE share_token = $1", share_token)
    if not invitation:
        print(f"DEBUG: Token not found in database: {share_token}")
        raise HTTPException(status_code=404, detail="Invalid share token")
    
    print(f"DEBUG: Found invitation {invitation['invitation_id']} for token {share_token}")
    rsvps = await crud.get_rsvps(conn, invitation['invitation_id'])
    print(f"DEBUG: Returning {len(rsvps)} RSVPs")
    inv_dict = dict(invitation)
    import json
    for field in ['custom_config', 'gallery_photos', 'event_timeline', 'after_marriage_photos']:
        if inv_dict.get(field) and isinstance(inv_dict[field], str):
            try:
                inv_dict[field] = json.loads(inv_dict[field])
            except:
                inv_dict[field] = [] if 'photos' in field or 'timeline' in field else {}
        elif inv_dict.get(field) is None:
            inv_dict[field] = [] if 'photos' in field or 'timeline' in field else {}

    return {
        "invitation": inv_dict,
        "rsvps": [dict(r) for r in rsvps]
    }

# Template Endpoints
@app.post("/api/templates/", response_model=schemas.Template)
async def create_template(
    template: schemas.TemplateCreate,
    conn: asyncpg.Connection = Depends(get_db),
    admin: dict = Depends(auth.get_current_admin)
):
    return await crud.create_template(conn, template)

@app.post("/api/templates/{template_id}/duplicate", response_model=schemas.Template)
async def duplicate_template(
    template_id: str,
    conn: asyncpg.Connection = Depends(get_db),
    admin: dict = Depends(auth.get_current_admin)
):
    import uuid
    try:
        template_uuid = uuid.UUID(template_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid template ID format")
    
    db_template = await crud.get_template_by_id(conn, template_uuid)
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    duplicate_data = schemas.TemplateCreate(
        name=f"Copy of {db_template['name']}",
        category=db_template.get('category'),
        config=db_template.get('config'),
        is_system=False
    )
    
    return await crud.create_template(conn, duplicate_data)

@app.delete("/api/templates/{template_id}")
async def delete_template(
    template_id: str,
    conn: asyncpg.Connection = Depends(get_db),
    admin: dict = Depends(auth.get_current_admin)
):
    import uuid
    try:
        template_uuid = uuid.UUID(template_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid template ID format")
    
    db_template = await crud.get_template_by_id(conn, template_uuid)
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    await conn.execute("DELETE FROM templates WHERE id = $1", template_uuid)
    return {"message": "Template deleted successfully"}

@app.get("/api/templates/", response_model=List[schemas.Template])
async def list_templates(conn: asyncpg.Connection = Depends(get_db)):
    return await crud.get_templates(conn)

@app.get("/api/templates/{template_id}", response_model=schemas.Template)
async def get_template(template_id: str, conn: asyncpg.Connection = Depends(get_db)):
    import uuid
    db_template = await crud.get_template_by_id(conn, uuid.UUID(template_id))
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    return db_template

@app.put("/api/templates/{template_id}", response_model=schemas.Template)
async def update_template(
    template_id: str,
    template: schemas.TemplateUpdate,
    conn: asyncpg.Connection = Depends(get_db),
    admin: dict = Depends(auth.get_current_admin)
):
    import uuid
    db_template = await crud.get_template_by_id(conn, uuid.UUID(template_id))
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    return await crud.update_template(conn, uuid.UUID(template_id), template)

# Upload Endpoint
@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    admin: dict = Depends(auth.get_current_admin)
):
    try:
        file_extension = os.path.splitext(file.filename)[1]
        file_name = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(uploads_path, file_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"url": f"/static/uploads/{file_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Enquiry Endpoints
@app.post("/api/enquiries/", response_model=schemas.Enquiry)
async def create_enquiry(enquiry: schemas.EnquiryCreate, conn: asyncpg.Connection = Depends(get_db)):
    return await crud.create_enquiry(conn, enquiry)

@app.get("/api/enquiries/", response_model=List[schemas.Enquiry])
async def list_enquiries(
    conn: asyncpg.Connection = Depends(get_db),
    admin: dict = Depends(auth.get_current_admin)
):
    return await crud.get_enquiries(conn)

@app.put("/api/enquiries/{enquiry_id}/status", response_model=schemas.Enquiry)
async def update_enquiry_status(
    enquiry_id: str,
    enquiry_update: schemas.EnquiryUpdate,
    conn: asyncpg.Connection = Depends(get_db),
    admin: dict = Depends(auth.get_current_admin)
):
    try:
        enquiry_uuid = uuid.UUID(enquiry_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid enquiry ID format")
    
    updated = await crud.update_enquiry_status(conn, enquiry_uuid, enquiry_update.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return updated
