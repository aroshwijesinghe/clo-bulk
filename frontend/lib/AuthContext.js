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
  const [isAdmin, setIsAdmin] = useState(false);

  // Sync profile details (e.g. from Google OAuth metadata)
  const syncUserProfile = async (currentUser) => {
    if (!currentUser) return;
    try {
      const meta = currentUser.user_metadata || {};
      const name = meta.full_name || meta.name || currentUser.email?.split('@')[0] || '';
      const avatar = meta.avatar_url || meta.picture || null;

      const { data: profile } = await supabase
        .from('Profile')
        .select('id, displayName, avatarUrl')
        .eq('id', currentUser.id)
        .single();

      if (!profile) {
        await supabase.from('Profile').insert([{
          id: currentUser.id,
          displayName: name,
          avatarUrl: avatar,
        }]);
      } else if ((!profile.displayName && name) || (!profile.avatarUrl && avatar)) {
        await supabase.from('Profile').update({
          displayName: profile.displayName || name,
          avatarUrl: profile.avatarUrl || avatar,
          updatedAt: new Date().toISOString(),
        }).eq('id', currentUser.id);
      }
    } catch {
      // Non-fatal, profile might already be managed by trigger
    }
  };

  useEffect(() => {
    const fetchRole = async (currentUser) => {
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      // Check user metadata first
      if (
        currentUser.app_metadata?.role === 'admin' ||
        currentUser.user_metadata?.role === 'admin'
      ) {
        setIsAdmin(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('Profile')
          .select('role')
          .eq('id', currentUser.id)
          .single();

        if (!error && data?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    };

    // Clean hash token if present in URL
    const cleanUrlHash = () => {
      if (
        typeof window !== 'undefined' &&
        window.location.hash &&
        (window.location.hash.includes('access_token=') || window.location.hash.includes('id_token='))
      ) {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      setSession(initSession);
      const currentUser = initSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        syncUserProfile(currentUser);
        fetchRole(currentUser).finally(() => {
          cleanUrlHash();
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          syncUserProfile(currentUser);
          await fetchRole(currentUser);

          if (event === 'SIGNED_IN') {
            try {
              await supabase.from('LoginHistory').insert([{
                email: currentUser.email,
                login_time: new Date().toISOString(),
              }]);
            } catch {
              // Ignore duplicate or non-fatal
            }
          }
          cleanUrlHash();
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
