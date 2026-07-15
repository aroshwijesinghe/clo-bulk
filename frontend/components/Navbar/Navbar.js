'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/components/ThemeProvider/ThemeProvider';
import styles from './Navbar.module.css';

const navLinks = [
  { label: 'Campaigns', href: '/campaigns' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Start a Campaign', href: '/campaigns/create' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut, loading, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const userInitial = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          Bulk<span>Threads</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav} aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className={styles.actions}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={styles.themeBtn}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {!loading && (
            user ? (
              <div className={styles.userMenu}>
                {isAdmin && (
                  <Link href="/admin" className={styles.signInBtn} style={{ marginRight: 12, padding: '6px 12px', fontSize: '0.85rem' }}>
                    Admin Dashboard
                  </Link>
                )}
                <Link href="/profile" className={styles.avatar} title="Profile">
                  {userInitial}
                </Link>
                <button onClick={signOut} className={styles.signOutBtn}>
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link href="/auth" className={styles.signInBtn}>Sign In</Link>
                <Link href="/auth?mode=signup" className={styles.signUpBtn}>
                  Get Started
                </Link>
              </>
            )
          )}
        </div>

        {/* Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`${styles.line} ${menuOpen ? styles.open1 : ''}`} />
          <span className={`${styles.line} ${menuOpen ? styles.open2 : ''}`} />
          <span className={`${styles.line} ${menuOpen ? styles.open3 : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.mobileLink}>
                {link.label}
              </Link>
            ))}
            <div className={styles.mobileDivider} />
            {user ? (
              <>
                <Link href="/profile" className={styles.mobileLink}>My Profile</Link>
                <Link href="/orders" className={styles.mobileLink}>My Orders</Link>
                <Link href="/settings" className={styles.mobileLink}>Settings</Link>
                {isAdmin && <Link href="/admin" className={styles.mobileLink} style={{ color: 'var(--accent)' }}>Admin Dashboard</Link>}
                <button onClick={signOut} className={styles.mobileSignOut}>Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth" className={styles.mobileLink}>Sign In</Link>
                <Link href="/auth?mode=signup" className={`${styles.mobileLink} ${styles.mobileAccent}`}>
                  Create Account
                </Link>
              </>
            )}
            <button onClick={toggleTheme} className={styles.mobileTheme}>
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
