# Civitas - Find your next thing.
Run: `cp .env.example .env`, set DB_PASSWORD, then `docker compose up --build` and open http://localhost:8080.
Everyone registers at /register and chooses Attendee (book events) or Organiser (create and manage events).
Local dev: backend `mvn spring-boot:run` (needs Postgres + DB_PASSWORD), frontend `npm install && npm run dev`.
Tests: `cd backend && mvn verify`. CI: .github/workflows/ci.yml.
