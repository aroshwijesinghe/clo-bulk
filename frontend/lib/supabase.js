import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Public Supabase client for frontend use.
 * Uses the anon key — respects Row Level Security.
 * JWT tokens are automatically attached to all requests.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
