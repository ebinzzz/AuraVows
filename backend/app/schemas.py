from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional, List
import uuid

# User Schemas
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "client"
    invitation_id: Optional[str] = None

class User(UserBase):
    id: uuid.UUID
    role: str
    invitation_id: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Family Note Schemas
class FamilyNoteBase(BaseModel):
    member_name: str
    relation_type: str
    message: str
    display_order: Optional[int] = 0
    is_visible: Optional[bool] = True
    language: Optional[str] = None

class FamilyNoteCreate(FamilyNoteBase):
    pass

class FamilyNote(FamilyNoteBase):
    id: uuid.UUID
    invitation_id: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# RSVP Schemas
class RSVPBase(BaseModel):
    guest_name: Optional[str] = None
    attending: bool
    guest_count: int = 0
    dietary_preference: Optional[str] = None
    will_attend_reception: Optional[bool] = None
    message_to_couple: Optional[str] = None
    phone_number: Optional[str] = None

class RSVPCreate(RSVPBase):
    pass

class RSVP(RSVPBase):
    id: uuid.UUID
    invitation_id: str
    response_date: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Invitation Schemas
class InvitationBase(BaseModel):
    invitation_id: str
    bride_name: str
    groom_name: str
    bride_parents: Optional[str] = None
    groom_parents: Optional[str] = None
    bride_siblings: Optional[str] = None
    groom_siblings: Optional[str] = None
    bride_family_note: Optional[str] = None
    groom_family_note: Optional[str] = None
    wedding_date: date
    wedding_time: str
    wedding_time_end: Optional[str] = None
    venue_name: str
    venue_address: str
    venue_map_url: Optional[str] = None
    venue_phone: Optional[str] = None
    reception_date: Optional[date] = None
    reception_time: Optional[str] = None
    reception_time_end: Optional[str] = None
    reception_venue_name: Optional[str] = None
    reception_venue_address: Optional[str] = None
    reception_map_url: Optional[str] = None
    reception_phone: Optional[str] = None
    reception_note: Optional[str] = None
    special_message: Optional[str] = None
    dress_code: Optional[str] = None
    rsvp_deadline: Optional[date] = None
    max_guests: Optional[int] = None
    is_active: bool = True
    invitation_link: str
    qr_code_data: str
    template: Optional[str] = 'classic'
    share_token: Optional[str] = None
    hero_bg_image: Optional[str] = None
    hero_bg_opacity: Optional[float] = 0.5
    custom_config: Optional[dict] = None
    compliments_title: Optional[str] = "Best Compliments From"
    compliments_names: Optional[str] = None
    groom_family: Optional[str] = None
    bride_family: Optional[str] = None
    background_music_url: Optional[str] = None
    wedding_day_music_url: Optional[str] = None
    live_stream_url: Optional[str] = None
    gallery_photos: Optional[List[str]] = None
    event_timeline: Optional[List[dict]] = None
    invitation_wording: Optional[str] = "cordially request the honour of your presence with your family on the auspicious occasion of the marriage of our daughter"
    invitation_quote: Optional[str] = "And of everything We have created pairs, that you may remember."
    opening_verse: Optional[str] = "The Lord has made everything beautiful in his time"
    opening_verse_ref: Optional[str] = "Eccl - 3:11"
    hero_subtitle_1: Optional[str] = "Together with our families"
    hero_subtitle_2: Optional[str] = "We extend a warm invitation to join the wedding celebration of"
    after_marriage_photos: Optional[List[str]] = []
    after_marriage_text: Optional[str] = None
    after_marriage_bg_opacity: Optional[float] = 0.4
    parent_id: Optional[uuid.UUID] = None

class InvitationCreate(InvitationBase):
    pass

class InvitationUpdate(BaseModel):
    bride_name: Optional[str] = None
    groom_name: Optional[str] = None
    bride_parents: Optional[str] = None
    groom_parents: Optional[str] = None
    bride_siblings: Optional[str] = None
    groom_siblings: Optional[str] = None
    bride_family_note: Optional[str] = None
    groom_family_note: Optional[str] = None
    wedding_date: Optional[date] = None
    wedding_time: Optional[str] = None
    wedding_time_end: Optional[str] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    venue_map_url: Optional[str] = None
    venue_phone: Optional[str] = None
    reception_date: Optional[date] = None
    reception_time: Optional[str] = None
    reception_time_end: Optional[str] = None
    reception_venue_name: Optional[str] = None
    reception_venue_address: Optional[str] = None
    reception_map_url: Optional[str] = None
    reception_phone: Optional[str] = None
    reception_note: Optional[str] = None
    special_message: Optional[str] = None
    compliments_title: Optional[str] = None
    compliments_names: Optional[str] = None
    groom_family: Optional[str] = None
    bride_family: Optional[str] = None
    dress_code: Optional[str] = None
    rsvp_deadline: Optional[date] = None
    max_guests: Optional[int] = None
    is_active: Optional[bool] = None
    invitation_link: Optional[str] = None
    qr_code_data: Optional[str] = None
    template: Optional[str] = None
    share_token: Optional[str] = None
    hero_bg_image: Optional[str] = None
    hero_bg_opacity: Optional[float] = None
    custom_config: Optional[dict] = None
    background_music_url: Optional[str] = None
    wedding_day_music_url: Optional[str] = None
    live_stream_url: Optional[str] = None
    gallery_photos: Optional[List[str]] = None
    event_timeline: Optional[List[dict]] = None
    invitation_wording: Optional[str] = None
    invitation_quote: Optional[str] = None
    opening_verse: Optional[str] = None
    opening_verse_ref: Optional[str] = None
    hero_subtitle_1: Optional[str] = None
    hero_subtitle_2: Optional[str] = None
    after_marriage_photos: Optional[List[str]] = None
    after_marriage_text: Optional[str] = None
    after_marriage_bg_opacity: Optional[float] = None
    parent_id: Optional[uuid.UUID] = None

class Invitation(InvitationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class SharedRSVPResponse(BaseModel):
    invitation: Invitation
    rsvps: List[RSVP]

# Template Schemas
class TemplateBase(BaseModel):
    name: str
    category: Optional[str] = None
    config: dict
    is_system: bool = False

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    config: Optional[dict] = None
    is_system: Optional[bool] = None

class Template(TemplateBase):
    id: uuid.UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Enquiry Schemas
class EnquiryBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: Optional[str] = None

class EnquiryCreate(EnquiryBase):
    pass

class EnquiryUpdate(BaseModel):
    status: Optional[str] = None

class Enquiry(EnquiryBase):
    id: uuid.UUID
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
