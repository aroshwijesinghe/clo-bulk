'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './callback.module.css';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState('');
  const [status, setStatus] = useState('Verifying your session...');

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        // 1. Check for error in query parameters or hash
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        
        const error = urlParams.get('error') || hashParams.get('error');
        const errorDescription =
          urlParams.get('error_description') ||
          hashParams.get('error_description') ||
          urlParams.get('message');

        if (error || errorDescription) {
          if (isMounted) {
            setErrorMsg(errorDescription || error || 'Authentication failed. Please try again.');
          }
          return;
        }

        // 2. Wait for Supabase to resolve the session from hash/cookies or PKCE code
        setStatus('Setting up your account...');

        // Check for PKCE authorization code
        const code = urlParams.get('code');
        if (code) {
          try {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchangeError && data?.session) {
              if (window.history && window.history.replaceState) {
                window.history.replaceState(null, '', window.location.pathname);
              }
              router.replace('/campaigns');
              return;
            }
          } catch (pkceErr) {
            console.warn('PKCE exchange error:', pkceErr);
          }
        }

        // Try getting current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          // Clean the URL hash/query
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          router.replace('/campaigns');
          return;
        }

        // 3. If session is not immediately available, listen to onAuthStateChange
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            if (currentSession && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
              subscription.unsubscribe();
              if (window.history && window.history.replaceState) {
                window.history.replaceState(null, '', window.location.pathname);
              }
              router.replace('/campaigns');
            }
          }
        );

        // Fallback timeout: if after 5 seconds no session is found
        const timeout = setTimeout(() => {
          if (isMounted) {
            subscription.unsubscribe();
            // Check once more before giving up
            supabase.auth.getSession().then(({ data: { session: finalSession } }) => {
              if (finalSession) {
                router.replace('/campaigns');
              } else {
                setErrorMsg('Unable to retrieve session. Please sign in again.');
              }
            });
          }
        }, 5000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timeout);
        };
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err?.message || 'Authentication error. Please try again.');
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {!errorMsg ? (
          <>
            <div className={styles.spinnerContainer}>
              <div className={styles.spinner} />
            </div>
            <h1 className={styles.title}>Signing you in...</h1>
            <p className={styles.desc}>{status}</p>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Sign-In Problem</h1>
            <div className={styles.errorBox}>{errorMsg}</div>
            <p className={styles.desc}>
              Please return to the login page and try signing in again.
            </p>
            <Link href="/auth" className={styles.btn}>
              Return to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner} />
          </div>
          <h1 className={styles.title}>Loading...</h1>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
