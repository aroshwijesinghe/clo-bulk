import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // use service role on backend for full DB access

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
}

/**
 * Supabase admin client for server-side DB operations.
 * Uses the Service Role key so it bypasses Row Level Security (RLS).
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
