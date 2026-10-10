ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
UPDATE users SET role = 'ORGANIZER' WHERE role = 'ADMIN';
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('USER','ORGANIZER'));
