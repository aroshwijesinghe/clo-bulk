'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

/**
 * HOW JWT AUTHENTICATION WORKS IN THIS APP:
 * ─────────────────────────────────────────────────────────────
 * 1. User signs in via email/password or Google OAuth.
 * 2. Supabase returns a JWT (JSON Web Token) — a signed string
 *    containing the user's ID, email, and expiry timestamp.
 * 3. The Supabase JS client automatically stores this JWT in
 *    localStorage and attaches it as a Bearer token on all
 *    subsequent API requests: Authorization: Bearer <jwt>
 * 4. The Supabase backend verifies the JWT signature using your
 *    project's secret key (stored server-side in Supabase).
 * 5. Row Level Security (RLS) policies in Postgres use
 *    auth.uid() which reads the user ID from the verified JWT.
 * 6. The JWT auto-refreshes before it expires (Supabase handles
 *    this automatically via the client library).
 *
 * YOU don't need to handle tokens manually. The Supabase client
 * does all of this for you transparently.
 * ─────────────────────────────────────────────────────────────
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session (reads JWT from localStorage)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
