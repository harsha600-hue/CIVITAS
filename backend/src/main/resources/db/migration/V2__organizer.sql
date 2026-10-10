ALTER TABLE events ADD COLUMN organizer_id BIGINT REFERENCES users(id);
CREATE INDEX idx_events_organizer ON events(organizer_id);
