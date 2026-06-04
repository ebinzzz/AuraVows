-- Database Schema for Wedding Invitation System

-- Invitations Table
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY,
    invitation_id VARCHAR(20) UNIQUE NOT NULL,
    bride_name VARCHAR(100) NOT NULL,
    groom_name VARCHAR(100) NOT NULL,
    bride_parents VARCHAR(300),
    groom_parents VARCHAR(300),
    bride_siblings TEXT,
    groom_siblings TEXT,
    bride_family_note TEXT,
    groom_family_note TEXT,
    wedding_date DATE NOT NULL,
    wedding_time VARCHAR(20) NOT NULL,
    wedding_time_end VARCHAR(20),
    venue_name VARCHAR(200) NOT NULL,
    venue_address TEXT NOT NULL,
    venue_map_url VARCHAR(500),
    venue_phone VARCHAR(30),
    reception_date DATE,
    reception_time VARCHAR(20),
    reception_time_end VARCHAR(20),
    reception_venue_name VARCHAR(200),
    reception_venue_address TEXT,
    reception_map_url VARCHAR(500),
    reception_phone VARCHAR(30),
    reception_note TEXT,
    special_message TEXT,
    dress_code VARCHAR(100),
    rsvp_deadline DATE,
    max_guests INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    invitation_link VARCHAR(500) NOT NULL,
    qr_code_data TEXT NOT NULL,
    template VARCHAR(50) DEFAULT 'classic',
    share_token VARCHAR(100),
    hero_bg_image VARCHAR(500),
    hero_bg_opacity FLOAT DEFAULT 0.5,
    custom_config JSONB,
    compliments_title VARCHAR(200) DEFAULT 'Best Compliments From',
    compliments_names TEXT,
    background_music_url VARCHAR(500),
    gallery_photos JSONB,
    event_timeline JSONB,
    invitation_wording TEXT,
    invitation_quote TEXT,
    opening_verse TEXT,
    opening_verse_ref TEXT,
    hero_subtitle_1 TEXT,
    hero_subtitle_2 TEXT,
    after_marriage_photos JSONB,
    after_marriage_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure columns exist for existing databases
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS hero_bg_image VARCHAR(500);
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS hero_bg_opacity FLOAT DEFAULT 0.5;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS custom_config JSONB;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS compliments_title VARCHAR(200) DEFAULT 'Best Compliments From';
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS compliments_names TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS groom_family VARCHAR(200);
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS bride_family VARCHAR(200);
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS background_music_url VARCHAR(500);
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS gallery_photos JSONB;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS event_timeline JSONB;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS invitation_wording TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS invitation_quote TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS opening_verse TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS opening_verse_ref TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS hero_subtitle_1 TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS hero_subtitle_2 TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS after_marriage_photos JSONB;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS after_marriage_text TEXT;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(200) NOT NULL,
    role VARCHAR(20) DEFAULT 'client',
    invitation_id VARCHAR(20) REFERENCES invitations(invitation_id) ON DELETE CASCADE
);

-- Family Notes Table
CREATE TABLE IF NOT EXISTS family_notes (
    id UUID PRIMARY KEY,
    invitation_id VARCHAR(20) REFERENCES invitations(invitation_id) ON DELETE CASCADE,
    member_name VARCHAR(100) NOT NULL,
    relation_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    language VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RSVPs Table
CREATE TABLE IF NOT EXISTS rsvps (
    id UUID PRIMARY KEY,
    invitation_id VARCHAR(20) REFERENCES invitations(invitation_id) ON DELETE CASCADE,
    guest_name VARCHAR(100),
    attending BOOLEAN NOT NULL,
    guest_count INTEGER DEFAULT 0,
    dietary_preference VARCHAR(100),
    will_attend_reception BOOLEAN,
    message_to_couple TEXT,
    phone_number VARCHAR(20),
    response_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(invitation_id);
