-- Migration: Add google_id to users and align photo_url
ALTER TABLE users ADD COLUMN google_id VARCHAR(64) UNIQUE;
-- Optionally, ensure photo_url is used for Google profile picture
-- No change needed if photo_url already exists
