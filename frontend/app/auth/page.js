'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from './auth.module.css';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Mode: 'card' (login/signup via 3D flip) or 'forgot' / 'reset' / 'verify'
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [isFlipped, setIsFlipped] = useState(initialMode === 'signup');
  const [specialMode, setSpecialMode] = useState(null); // 'forgot', 'reset', 'verify'

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.replace('/campaigns');
  }, [user, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const flipCard = () => {
    setError('');
    setMessage('');
    setIsFlipped(!isFlipped);
  };

  // Google OAuth Authentication
  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/campaigns` : undefined;
      
      // Request OAuth URL with skipBrowserRedirect to pre-validate provider status
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;

      if (data?.url) {
        // Pre-check if the provider endpoint returns 400 (i.e. provider is not enabled in Supabase)
        try {
          const testRes = await fetch(data.url, { method: 'GET' });
          if (!testRes.ok) {
            const errJson = await testRes.json().catch(() => null);
            if (errJson?.msg?.includes('provider is not enabled') || errJson?.code === 400) {
              throw new Error(
                'Google sign-in is not enabled yet in your Supabase project (lafrwgoojoqijimsixsz). Please enable Google in Supabase Dashboard (Authentication > Providers > Google).'
              );
            }
            throw new Error(errJson?.msg || 'Google authentication failed');
          }
        } catch (fetchErr) {
          if (fetchErr.message && fetchErr.message.includes('not enabled')) {
            throw fetchErr;
          }
          // Note: When Google provider IS enabled, the fetch will hit accounts.google.com and be blocked by CORS redirect, which is expected!
        }

        // Provider is enabled - proceed with normal redirect
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err?.message || 'Failed to authenticate with Google');
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;

      try {
        await supabase.from('LoginHistory').insert([{ email: loginEmail, login_time: new Date().toISOString() }]);
      } catch (err) {
        console.warn('Could not save login history.', err);
      }

      setMessage('✓ Logged in successfully!');
      setTimeout(() => router.push('/campaigns'), 600);
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: { data: { full_name: signupName } },
      });
      if (error) throw error;

      if (data?.session) {
        router.push('/campaigns');
      } else {
        setMessage('Verification code sent to your email!');
        setSpecialMode('verify');
      }
    } catch (err) {
      setError(err?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const targetEmail = isFlipped ? signupEmail : loginEmail;

    try {
      const type = specialMode === 'reset' ? 'recovery' : 'signup';
      const { error } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: otpCode,
        type,
      });
      if (error) throw error;

      if (specialMode === 'reset') {
        const { error: updateError } = await supabase.auth.updateUser({ password: loginPassword || signupPassword });
        if (updateError) throw updateError;
        setMessage('Password updated successfully! Redirecting...');
        setTimeout(() => router.push('/campaigns'), 1200);
      } else {
        try {
          await supabase.from('LoginHistory').insert([{ email: targetEmail, login_time: new Date().toISOString() }]);
        } catch (err) {
          console.warn('Could not save login history.', err);
        }
        setMessage('Account verified! Redirecting...');
        setTimeout(() => router.push('/campaigns'), 800);
      }
    } catch (err) {
      setError(err?.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e?.preventDefault?.();
    if (!loginEmail) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail);
      if (error) throw error;
      setMessage('Password reset code sent to your email.');
      setSpecialMode('reset');
    } catch (err) {
      setError(err?.message || 'Could not send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    const targetEmail = isFlipped ? signupEmail : loginEmail;
    if (!targetEmail) return;

    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.resend({
        type: specialMode === 'reset' ? 'recovery' : 'signup',
        email: targetEmail,
      });
      if (error) throw error;
      setMessage('A new code has been sent.');
      setResendCooldown(60);
    } catch (err) {
      setError(err?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Decorative floating embossed background circles */}
      <div className={`${styles.bgCircle} ${styles.bg1}`} aria-hidden="true" />
      <div className={`${styles.bgCircle} ${styles.bg2}`} aria-hidden="true" />
      <div className={`${styles.bgCircle} ${styles.bg3}`} aria-hidden="true" />
      <div className={`${styles.bgCircle} ${styles.bg4}`} aria-hidden="true" />

      <div className={styles.authWrapper}>
        {/* Special Mode Overlay (Verify OTP or Reset Password) */}
        {specialMode ? (
          <div className={`${styles.formPanel}`} style={{ position: 'relative', width: '100%', minHeight: '520px' }}>
            <div className={styles.logo}>
              {specialMode === 'verify' ? '✉️' : '🔑'}
            </div>
            <h1 className={styles.title}>
              {specialMode === 'verify' ? 'Verify Email' : 'Reset Password'}
            </h1>
            <p className={styles.subtitle}>
              {specialMode === 'verify'
                ? `Enter the 6-digit code sent to ${isFlipped ? signupEmail : loginEmail}`
                : 'Enter the code and set your new password'}
            </p>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {message && <div className={styles.successMsg}>{message}</div>}

            <form onSubmit={handleVerifyOtp} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  id="otpCode"
                  placeholder=" "
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  autoComplete="one-time-code"
                  required
                />
                <label htmlFor="otpCode">6-Digit Code</label>
              </div>

              {specialMode === 'reset' && (
                <div className={styles.inputGroup}>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    id="newResetPassword"
                    placeholder=" "
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="newResetPassword">New Password</label>
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showLoginPassword ? '🙈' : '👁'}
                  </button>
                </div>
              )}

              <div className={styles.options}>
                <button
                  type="button"
                  className={styles.forgotBtn}
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
                <button
                  type="button"
                  className={styles.forgotBtn}
                  onClick={() => { setSpecialMode(null); setError(''); setMessage(''); }}
                >
                  Back to Sign In
                </button>
              </div>

              <button type="submit" className={styles.mainBtn} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : specialMode === 'verify' ? 'VERIFY & CONTINUE' : 'UPDATE PASSWORD'}
              </button>
            </form>
          </div>
        ) : (
          <div className={`${styles.authCard} ${isFlipped ? styles.flipped : ''}`} id="authCard">
            {/* ─── LOGIN PANEL (Front) ─── */}
            <div className={`${styles.formPanel} ${styles.loginPanel}`}>
              <div>
                <div className={styles.logo} title="BulkThreads Security">
                  🔐
                </div>
                <h1 className={styles.title}>Welcome</h1>
                <p className={styles.subtitle}>Login to continue your journey</p>

                {error && !isFlipped && <div className={styles.errorMsg}>{error}</div>}
                {message && !isFlipped && <div className={styles.successMsg}>{message}</div>}

                {/* Google Authentication Button */}
                <button
                  type="button"
                  className={styles.googleBtn}
                  onClick={handleGoogle}
                  disabled={loading}
                  aria-label="Continue with Google"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className={styles.divider}>
                  <span className={styles.dividerLine} />
                  <span className={styles.dividerText}>or continue with email</span>
                  <span className={styles.dividerLine} />
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                  {/* EMAIL */}
                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      id="loginEmail"
                      placeholder=" "
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                    <label htmlFor="loginEmail">Email Address</label>
                  </div>

                  {/* PASSWORD */}
                  <div className={styles.inputGroup}>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      id="loginPassword"
                      placeholder=" "
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <label htmlFor="loginPassword">Password</label>
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? '🙈' : '👁'}
                    </button>
                  </div>

                  <div className={styles.options}>
                    <label className={styles.checkbox}>
                      <input type="checkbox" defaultChecked />
                      Remember me
                    </label>
                    <button
                      type="button"
                      className={styles.forgotBtn}
                      onClick={() => {
                        if (!loginEmail) {
                          setError('Please enter your email above to reset password.');
                          return;
                        }
                        handleForgotPassword();
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" className={styles.mainBtn} disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : 'LOGIN'}
                  </button>
                </form>
              </div>

              <div>
                <div className={styles.switchArea}>
                  <span>Don&apos;t have an account?</span>
                  <button
                    type="button"
                    className={styles.switchCircle}
                    onClick={flipCard}
                    aria-label="Switch to Create Account"
                    title="Create Account"
                  >
                    +
                  </button>
                </div>

                <div className={styles.social}>
                  <button
                    type="button"
                    onClick={handleGoogle}
                    title="Sign in with Google"
                    aria-label="Google"
                  >
                    G
                  </button>
                  <button
                    type="button"
                    onClick={() => {}}
                    title="Facebook"
                    aria-label="Facebook"
                  >
                    f
                  </button>
                  <button
                    type="button"
                    onClick={() => {}}
                    title="LinkedIn"
                    aria-label="LinkedIn"
                  >
                    in
                  </button>
                </div>
              </div>
            </div>

            {/* ─── SIGNUP PANEL (Back - 180deg) ─── */}
            <div className={`${styles.formPanel} ${styles.signupPanel}`}>
              <div>
                <div className={styles.logo} title="Create BulkThreads Account">
                  ✨
                </div>
                <h1 className={styles.title}>Create Account</h1>
                <p className={styles.subtitle}>Start your journey with us</p>

                {error && isFlipped && <div className={styles.errorMsg}>{error}</div>}
                {message && isFlipped && <div className={styles.successMsg}>{message}</div>}

                {/* Google Authentication Button */}
                <button
                  type="button"
                  className={styles.googleBtn}
                  onClick={handleGoogle}
                  disabled={loading}
                  aria-label="Sign up with Google"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Sign up with Google</span>
                </button>

                {/* Divider */}
                <div className={styles.divider}>
                  <span className={styles.dividerLine} />
                  <span className={styles.dividerText}>or continue with email</span>
                  <span className={styles.dividerLine} />
                </div>

                <form onSubmit={handleSignup} className={styles.form}>
                  {/* NAME */}
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      id="signupName"
                      placeholder=" "
                      autoComplete="name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                    <label htmlFor="signupName">Full Name</label>
                  </div>

                  {/* EMAIL */}
                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      id="signupEmail"
                      placeholder=" "
                      autoComplete="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                    <label htmlFor="signupEmail">Email Address</label>
                  </div>

                  {/* PASSWORD */}
                  <div className={styles.inputGroup}>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      id="signupPassword"
                      placeholder=" "
                      autoComplete="new-password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                    <label htmlFor="signupPassword">Password</label>
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showSignupPassword ? '🙈' : '👁'}
                    </button>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div className={styles.inputGroup}>
                    <input
                      type="password"
                      id="confirmPassword"
                      placeholder=" "
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                  </div>

                  <button type="submit" className={styles.mainBtn} disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : 'CREATE ACCOUNT'}
                  </button>
                </form>
              </div>

              <div>
                <div className={styles.switchArea}>
                  <span>Already have an account?</span>
                  <button
                    type="button"
                    className={styles.switchCircle}
                    onClick={flipCard}
                    aria-label="Switch to Login"
                    title="Login"
                  >
                    ←
                  </button>
                </div>

                <div className={styles.social}>
                  <button
                    type="button"
                    onClick={handleGoogle}
                    title="Sign up with Google"
                    aria-label="Google"
                  >
                    G
                  </button>
                  <button
                    type="button"
                    onClick={() => {}}
                    title="Facebook"
                    aria-label="Facebook"
                  >
                    f
                  </button>
                  <button
                    type="button"
                    onClick={() => {}}
                    title="LinkedIn"
                    aria-label="LinkedIn"
                  >
                    in
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
      <AuthForm />
    </Suspense>
  );
}
