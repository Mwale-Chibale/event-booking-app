# Event Booking & Ticketing System

## Architecture

Full-stack web application built with **Next.js 15 (App Router)**. The backend is implemented as API Route Handlers inside the same Next.js project
src/
app/
api/
auth/         → register, login, me
events/       → CRUD + per-event booking
bookings/     → list + cancel
dashboard/    → organiser views
context/
AuthContext.tsx → global auth state (token + user)
components/
Navbar.tsx
LoadingSpinner.tsx
ErrorMessage.tsx
lib/
prisma.ts       → Prisma client singleton
auth.ts         → JWT sign/verify helpers
prisma/
schema.prisma     → 3 relational models
migrations/       → SQL migration files
seed.ts           → sample data script

**Key design decisions:**
- JWT stored in localStorage, sent as `Authorization: Bearer <token>` on every protected request
- `withAuth()` wrapper in `lib/auth.ts` centralises authentication logic
- Overbooking prevented using `prisma.$transaction()` — atomically checks capacity and creates booking
- Prisma singleton in `lib/prisma.ts` prevents connection exhaustion in Next.js dev mode

---

## Data Models

| Model | Description |
|---|---|
| `User` | Registered users with role `ORGANISER` or `ATTENDEE` |
| `Event` | Events created by organisers |
| `Booking` | A user's reservation for an event |

---

## Setup Instructions

### Prerequisites
- Node.js 20+
- npm 9+

### 1. Clone and install

```bash
git clone <your-repo-url>
cd event-booking-app
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env` and set a strong `JWT_SECRET`.

### 3. Run migrations and seed the database

```bash
npx prisma migrate dev
npx prisma db seed
```

**Test credentials:**

| Role | Email | Password |
|---|---|---|
| Organiser | `alice@test.com` | `password123` |
| Organiser | `bob@test.com` | `password123` |
| Attendee | `carol@test.com` | `password123` |
| Attendee | `dave@test.com` | `password123` |
| Attendee | `eve@test.com` | `password123` |

### 4. Start development server

```bash
npm run dev
```

App runs at `http://localhost:3000`

---

## API Documentation

All protected routes require: `Authorization: Bearer <token>`

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Body: `{ name, email, password, role? }` |
| POST | `/api/auth/login` | Public | Body: `{ email, password }` → returns token |
| GET | `/api/auth/me` | Any | Returns current user profile |

### Events

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/events` | Public | Paginated list. Query: `?page=1&limit=12` |
| POST | `/api/events` | Organiser | Body: `{ title, description, date, capacity }` |
| GET | `/api/events/:id` | Public | Single event with `spotsLeft` |
| PUT | `/api/events/:id` | Organiser (owner) | Update any event field |
| DELETE | `/api/events/:id` | Organiser (owner) | Deletes event and its bookings |

### Bookings

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/events/:id/bookings` | Attendee | Book a ticket. 409 if full or already booked |
| GET | `/api/bookings` | Any | List own bookings |
| DELETE | `/api/bookings/:id` | Attendee (owner) | Cancel booking |

### Dashboard

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/events` | Organiser | Own events with `ticketsSold` and `spotsLeft` |
| GET | `/api/dashboard/events/:id/attendees` | Organiser (owner) | Attendee list for an event |

---

## Docker Deployment

```bash
cp .env.example .env
# Edit .env and set JWT_SECRET

docker compose up --build
```

App available at `http://localhost:3000`

---

## Attribution

All code was written by the team. The following files contain sections assisted by AI (Claude, Anthropic) and are marked with inline comments:

- `src/app/api/**/*.ts` — route handler structure
- `src/lib/auth.ts` — JWT pattern
- `src/context/AuthContext.tsx` — React Context pattern
- `prisma/seed.ts` — seed data structure
- `Dockerfile` — multi-stage build pattern
