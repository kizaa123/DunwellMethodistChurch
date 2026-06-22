# Grace Methodist Church Website

A professional, full-stack church management website built with Next.js, Node.js, Express, and PostgreSQL.

## Architecture

```
                 Visitors
                    |
                    |
              Next.js Website (frontend/)
                    |
          ---------------------
          |                   |
     Public Pages        Member Portal
          |                   |
          |              Admin Dashboard
          |
        API (backend/)
          |
    Node.js + Express
          |
    PostgreSQL (Prisma)
          |
    Cloud Storage (future: Cloudinary)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL with Prisma ORM |
| Auth | JWT (JSON Web Tokens) |

## Project Structure

```
METHODIST CHURCH/
├── frontend/                 # Next.js public website + admin UI
│   ├── src/app/              # Pages (App Router)
│   │   ├── page.tsx          # Home
│   │   ├── about/
│   │   ├── sermons/
│   │   ├── events/
│   │   ├── ministries/
│   │   ├── contact/
│   │   ├── donations/
│   │   ├── members/          # Member portal
│   │   └── admin/            # Admin dashboard
│   ├── src/components/       # Reusable UI components
│   ├── src/lib/              # API client & static data
│   └── src/types/            # TypeScript types
│
└── backend/                  # Express API server
    ├── src/
    │   ├── controllers/      # Request handlers
    │   ├── services/         # Business logic
    │   ├── routes/           # API routes
    │   ├── middleware/       # Auth middleware
    │   └── database/         # Prisma client
    └── prisma/
        └── schema.prisma     # Database schema
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Supabase](https://supabase.com))

### 1. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs at **http://localhost:3000**

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL connection string
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Backend runs at **http://localhost:5000**

### Default Admin Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gracemethodist.org | admin123 |
| Pastor | pastor@gracemethodist.org | pastor123 |

## Pages

### Public Website
- **Home** — Hero, introduction, latest sermon, events, gallery, CTA
- **About** — History, vision, mission, leadership
- **Ministries** — Youth, Women, Men, Children
- **Sermons** — Video, audio, and notes
- **Events** — Calendar and registration
- **Giving** — Online donations
- **Contact** — Contact form and map

### Member Portal
- Login / Register
- Profile, groups, giving history

### Admin Dashboard (`/admin`)
- Dashboard with stats
- Manage members
- Upload sermons
- Create events
- Post announcements
- View donations
- Manage gallery

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| GET | `/api/sermons` | List sermons |
| GET | `/api/events` | List events |
| POST | `/api/donations` | Create donation |
| POST | `/api/contact` | Send contact message |
| GET | `/api/admin/stats` | Dashboard stats (auth) |
| POST | `/api/admin/sermons` | Upload sermon (auth) |
| POST | `/api/admin/events` | Create event (auth) |

## Deployment

| Service | Recommended Platform |
|---------|---------------------|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) or [Railway](https://railway.app) |
| Database | [Supabase PostgreSQL](https://supabase.com) |
| File Storage | [Cloudinary](https://cloudinary.com) |

## Future Features

- Mobile app
- Live streaming
- Stripe/PayPal payment integration
- Prayer requests
- SMS notifications
- Church attendance tracking
- AI assistant

## License

Private — Grace Methodist Church
