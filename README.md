# BulkThreads 🧵

> **Group buying for premium clothing. Wholesale prices, together.**

BulkThreads is a modern bulk-order platform where people join campaigns to hit a minimum quantity target — unlocking wholesale pricing for everyone. Built with **Next.js 16**, **FastAPI (Python)**, and **Supabase** (PostgreSQL + Auth).

---

## 📁 Project Structure

```
clo-bulk/
├── frontend/          ← Next.js 16 app (UI, pages, components)
│   ├── app/
│   │   ├── page.js              ← Home page (hero + live campaigns)
│   │   ├── layout.js            ← Root layout (auth + theme providers)
│   │   ├── globals.css          ← Design system & dark/light mode
│   │   ├── page.module.css
│   │   ├── auth/                ← Sign In / Create Account / Google Auth
│   │   ├── campaigns/           ← All campaigns listing
│   │   ├── campaigns/create/    ← Start a new bulk order campaign
│   │   ├── orders/              ← User's order history
│   │   ├── profile/             ← User profile editor
│   │   └── settings/            ← App preferences & account settings
│   ├── components/
│   │   ├── Navbar/              ← Global nav with auth state + theme toggle
│   │   ├── Footer/              ← Site footer
│   │   ├── CampaignCard/        ← Campaign listing card with product image
│   │   ├── CampaignModal/       ← Join campaign modal (size, qty, order)
│   │   ├── HowItWorks/          ← Animated 4-step explainer section
│   │   └── ThemeProvider/       ← Dark / Light mode context
│   ├── lib/
│   │   ├── supabase.js          ← Browser Supabase client (anon key)
│   │   └── AuthContext.js       ← JWT auth context + session management
│   ├── public/images/           ← AI-generated product photos
│   ├── .env.local               ← Frontend env vars (Supabase public keys)
│   └── package.json
│
├── backend/           ← FastAPI REST API
│   ├── app/
│   ├── lib/
│   ├── main.py              ← FastAPI entry point (port 8000)
│   ├── seed.py              ← Database seeder script
│   ├── schema.sql           ← ⚠️ Run this in Supabase SQL Editor first!
│   ├── .env                 ← Backend env vars (service role key)
│   └── requirements.txt
│
├── requirements.txt   ← Human-readable dependency reference
└── README.md
```

---

## 🗄️ Database Setup (IMPORTANT — do this first!)

The database tables **must be created manually** in your Supabase SQL Editor before running the app.

### Steps:
1. Open your Supabase dashboard: https://supabase.com/dashboard/project/lafrwgoojoqijimsixsz/sql
2. Click **New Query**
3. Copy and paste the entire contents of [`backend/schema.sql`](./backend/schema.sql)
4. Click **Run**

This creates:
- `Campaign` table — bulk order campaigns
- `Order` table — user orders joined to campaigns
- `Profile` table — extends Supabase auth users
- RLS (Row Level Security) policies
- Auto-profile creation trigger on signup

---

## 🚀 How to Run

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### 1. Install Frontend Dependencies
```bash
# Run from: clo-bulk/frontend/
cd frontend
npm install
```

### 2. Install Backend Dependencies
```bash
# Run from: clo-bulk/backend/
cd backend
pip install -r requirements.txt
```

### 3. Seed the Database (optional, adds sample campaigns)
```bash
# Run from: clo-bulk/backend/
cd backend
python seed.py
```
> ⚠️ Run `schema.sql` in Supabase first, or this will fail.

### 4. Start the Backend Server
```bash
# Run from: clo-bulk/backend/
cd backend
python main.py
```
> Server starts at **http://localhost:8000**

### 5. Start the Frontend Dev Server
```bash
# Run from: clo-bulk/frontend/
cd frontend
npm run dev
```
> App opens at **http://localhost:3000**

---

## 🔐 Authentication — How JWT Works

BulkThreads uses **Supabase Auth with JWT** (JSON Web Tokens):

1. **Sign Up / Sign In** → Supabase returns a signed JWT containing your user ID and email
2. **JWT stored** automatically in `localStorage` by the Supabase JS client
3. **All API requests** automatically include `Authorization: Bearer <jwt>` in headers
4. **Supabase backend** verifies the JWT signature using your project's secret key
5. **Row Level Security** uses `auth.uid()` from the verified JWT — so users can only see their own orders and profile
6. **Auto-refresh** — Supabase silently refreshes your token before it expires. You don't need to do anything.

**Google OAuth:** Clicking "Continue with Google" redirects you to Google's login, then back to `/campaigns` with a valid JWT session automatically created.

---

## 🎨 Design System

| Token | Dark Mode | Light Mode |
|---|---|---|
| `--accent` | Electric Violet `#7c3aed` | Same |
| `--accent-light` | `#8b5cf6` | Same |
| `--citrine` | Neon Citrine `#d4af37` | `#b8860b` |
| `--bg` | `#0a0a0f` (Obsidian) | `#f8f7ff` |
| `--text-primary` | `#f0eff8` | `#0f0e1a` |

Toggle theme with the **☀️/🌙 button** in the navbar. Preference is saved to `localStorage`.

---

## 📦 Pages

| Page | Route | Auth Required |
|---|---|---|
| Home | `/` | No |
| All Campaigns | `/campaigns` | No |
| Start Campaign | `/campaigns/create` | ✅ Yes |
| Sign In / Register | `/auth` | No |
| My Orders | `/orders` | ✅ Yes |
| Profile | `/profile` | ✅ Yes |
| Settings | `/settings` | ✅ Yes |

---

## 🛣️ API Routes (Backend — port 8000)

| Method | Route | Description |
|---|---|---|
| GET | `/api/campaigns` | List all campaigns |
| GET | `/api/campaigns/:id` | Get single campaign + orders |
| POST | `/api/campaigns` | Create a campaign |
| PATCH | `/api/campaigns/:id` | Update a campaign |
| DELETE | `/api/campaigns/:id` | Delete a campaign |
| GET | `/api/orders` | List all orders |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders/:id` | Get a single order |

---

## 🔮 Upcoming Features (Next Phase)

- [ ] **Stripe Payments** — Charge on campaign goal completion
- [ ] **Admin Dashboard** — Campaign management, analytics
- [ ] **Real-time Updates** — Supabase Realtime for live participant count
- [ ] **Email Notifications** — Supabase Edge Functions + Resend
