-- ============================================================
-- BulkThreads — Supabase Database Schema
-- Run this in your Supabase Dashboard → SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/lafrwgoojoqijimsixsz/sql
-- ============================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Campaign Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Campaign" (
  "id"           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "title"        TEXT NOT NULL,
  "description"  TEXT NOT NULL,
  "price"        DECIMAL(10, 2) NOT NULL,
  "targetCount"  INTEGER NOT NULL DEFAULT 50,
  "currentCount" INTEGER NOT NULL DEFAULT 0,
  "endDate"      TIMESTAMPTZ NOT NULL,
  "imageUrl"     TEXT,
  "status"       TEXT NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'completed', 'cancelled')),
  "createdBy"    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Order Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Order" (
  "id"          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "campaignId"  UUID NOT NULL REFERENCES "Campaign"(id) ON DELETE CASCADE,
  "userId"      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "quantity"    INTEGER NOT NULL DEFAULT 1,
  "size"        TEXT,
  "color"       TEXT,
  "status"      TEXT NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Profile Table (extends Supabase auth.users) ───────────────
CREATE TABLE IF NOT EXISTS "Profile" (
  "id"          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "displayName" TEXT,
  "avatarUrl"   TEXT,
  "bio"         TEXT,
  "phone"       TEXT,
  "address"     TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Auto-create Profile on new user signup ────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."Profile" ("id", "displayName", "avatarUrl")
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Row Level Security (RLS) ──────────────────────────────────
ALTER TABLE "Campaign" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile"  ENABLE ROW LEVEL SECURITY;

-- Campaigns: everyone can view, authenticated users can create
CREATE POLICY "Anyone can view campaigns"   ON "Campaign" FOR SELECT USING (true);
CREATE POLICY "Auth users can create campaigns" ON "Campaign" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Creators can update campaigns"   ON "Campaign" FOR UPDATE USING (auth.uid() = "createdBy");
CREATE POLICY "Creators can delete campaigns"   ON "Campaign" FOR DELETE USING (auth.uid() = "createdBy");

-- Orders: only owner can see own orders, auth users can create
CREATE POLICY "Users can view own orders"   ON "Order" FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Auth users can create orders" ON "Order" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Profiles: users can view and update only their own profile
CREATE POLICY "Users can view own profile"   ON "Profile" FOR SELECT USING (auth.uid() = "id");
CREATE POLICY "Users can update own profile" ON "Profile" FOR UPDATE USING (auth.uid() = "id");

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_campaign_status ON "Campaign"("status");
CREATE INDEX IF NOT EXISTS idx_order_campaign  ON "Order"("campaignId");
CREATE INDEX IF NOT EXISTS idx_order_user      ON "Order"("userId");

-- ── Done ──────────────────────────────────────────────────────
SELECT 'Schema created successfully' AS result;
