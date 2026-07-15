'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from './auth.module.css';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.replace('/campaigns');
  }, [user, router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Log the login to LoginHistory table
        try {
          await supabase.from('LoginHistory').insert([{ email, login_time: new Date().toISOString() }]);
        } catch (err) {
          console.warn('Could not save login history. Table might not exist.', err);
        }

        router.push('/campaigns');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: displayName } },
        });
        if (error) throw error;
        setMessage('Code sent! Please check your email and enter the 6-digit code below.');
        setMode('verify');
      } else if (mode === 'verify') {
        const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
        if (error) throw error;
        
        try {
          await supabase.from('LoginHistory').insert([{ email, login_time: new Date().toISOString() }]);
        } catch (err) {
          console.warn('Could not save login history.', err);
        }

        router.push('/campaigns');
      }
    } catch (err) {
      let msg = 'Something went wrong';
      if (err instanceof Error) msg = err.message;
      else if (err?.message) msg = err.message;
      else if (err?.error_description) msg = err.error_description;
      else if (typeof err === 'string') msg = err;
      else msg = JSON.stringify(err);
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Background blobs */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className={styles.header}>
          <Link href="/" className={styles.brand}>BulkThreads</Link>
          <h1 className={styles.title}>
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Verify Email'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'login'
              ? 'Sign in to access bulk order campaigns'
              : mode === 'signup'
              ? 'Join thousands getting wholesale prices together'
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        {/* Mode toggle */}
        {mode !== 'verify' && (
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeBtn} ${mode === 'login' ? styles.modeActive : ''}`}
              onClick={() => { setMode('login'); setError(''); setMessage(''); }}
            >Sign In</button>
            <button
              className={`${styles.modeBtn} ${mode === 'signup' ? styles.modeActive : ''}`}
              onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
            >Create Account</button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className={styles.form} noValidate>
          <AnimatePresence mode="wait">
            {mode === 'verify' && (
              <motion.div
                key="otpCode"
                className={styles.field}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="otpCode" className={styles.label}>Verification Code</label>
                <input
                  id="otpCode"
                  type="text"
                  className={styles.input}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required={mode === 'verify'}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </motion.div>
            )}

            {mode === 'signup' && (
              <motion.div
                key="displayName"
                className={styles.field}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="displayName" className={styles.label}>Full Name</label>
                <input
                  id="displayName"
                  type="text"
                  className={styles.input}
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={mode === 'signup'}
                  autoComplete="name"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {mode !== 'verify' && (
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          )}

          {mode !== 'verify' && (
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="password" className={styles.label}>Password</label>
                {mode === 'login' && (
                  <button type="button" className={styles.forgotLink} onClick={async () => {
                    if (!email) { setError('Enter your email first'); return; }
                    await supabase.auth.resetPasswordForEmail(email);
                    setMessage('Password reset email sent!');
                  }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div className={styles.passwordWrap}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder={mode === 'signup' ? 'Minimum 6 characters' : 'Your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.p className={styles.error}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}>
                {error}
              </motion.p>
            )}
            {message && (
              <motion.p className={styles.successMsg}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}>
                {message}
              </motion.p>
            )}
          </AnimatePresence>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Verify & Login'
            )}
          </button>
        </form>

        {mode !== 'verify' && (
          <p className={styles.footer}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              className={styles.switchLink}
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }}
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <AuthForm />
    </Suspense>
  );
}
