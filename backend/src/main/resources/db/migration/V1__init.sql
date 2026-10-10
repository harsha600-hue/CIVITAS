CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE, password_hash VARCHAR(100) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('USER','ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY, title VARCHAR(200) NOT NULL, description TEXT NOT NULL,
  category VARCHAR(40) NOT NULL, venue VARCHAR(200) NOT NULL, city VARCHAR(100) NOT NULL,
  event_date TIMESTAMP NOT NULL, ticket_price NUMERIC(10,2) NOT NULL CHECK (ticket_price >= 0),
  total_tickets INT NOT NULL CHECK (total_tickets > 0),
  available_tickets INT NOT NULL,
  poster_url VARCHAR(500),
  status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (available_tickets >= 0 AND available_tickets <= total_tickets));
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_category ON events(category);
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY, booking_reference VARCHAR(20) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL REFERENCES users(id), event_id BIGINT NOT NULL REFERENCES events(id),
  quantity INT NOT NULL CHECK (quantity > 0), total_price NUMERIC(10,2) NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('CONFIRMED','CANCELLED')),
  booking_date TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_event ON bookings(event_id);
INSERT INTO events (title,description,category,venue,city,event_date,ticket_price,total_tickets,available_tickets,poster_url) VALUES
('Neon Fields Festival','Two stages, one open field, and a lineup of independent electronic acts.','Music','Mahalaxmi Racecourse','Mumbai', now()+interval '20 days',1499,500,500,NULL),
('Build in Public Summit','A day of talks and demos from founders shipping in the open.','Technology','Bandra Kurla Complex','Mumbai', now()+interval '35 days',799,200,200,NULL),
('Risograph Printing Workshop','Print your own zine with local artists. Materials included.','Workshops','Kala Ghoda Studio','Mumbai', now()+interval '12 days',999,25,25,NULL);
