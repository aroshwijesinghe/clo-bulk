# BulkThreads - Premium Group Buying Website

A platform for users to participate in group buying of premium clothing to achieve bulk order discounts. This Next.js application allows users to browse clothing items, join group buying campaigns, and track the progress of bulk orders until the minimum quantity for a discount is reached.

## Features

- **Fluid Apple-like UI**: Built using Vanilla CSS Modules and Framer Motion for premium aesthetics and micro-interactions.
- **Campaign Dashboard**: View active group buying campaigns and their progress.
- **Simulated Checkout**: Placeholders for e-commerce integration.
- **Supabase Database**: Uses a robust PostgreSQL database connected via Prisma ORM.

## Tech Stack

- **Frontend & Backend**: Next.js (App Router)
- **Styling**: Vanilla CSS Modules (Glassmorphism, Dark Mode)
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma Client

## Getting Started

1. Clone or download this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env.local` file with Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="..."
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   SUPABASE_SERVICE_ROLE_KEY="..."
   SUPABASE_DB_PASSWORD="..."
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres"
   ```
4. Push the Prisma schema to the database:
   ```bash
   npx prisma db push
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Next Phases

- Full implementation of NextAuth (Google/Email authentication).
- Integration of a real payment portal (e.g., Stripe) to handle campaign funding.
