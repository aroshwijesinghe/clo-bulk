import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <span className={styles.logo}>Bulk<span>Threads</span></span>
            <p className={styles.tagline}>
              Group buying for premium clothing.<br />
              Wholesale prices, together.
            </p>
          </div>
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <p className={styles.groupTitle}>Platform</p>
              <Link href="/campaigns" className={styles.link}>Browse Campaigns</Link>
              <Link href="/campaigns/create" className={styles.link}>Start a Campaign</Link>
              <Link href="/#how-it-works" className={styles.link}>How It Works</Link>
            </div>
            <div className={styles.linkGroup}>
              <p className={styles.groupTitle}>Account</p>
              <Link href="/profile" className={styles.link}>Profile</Link>
              <Link href="/orders" className={styles.link}>My Orders</Link>
              <Link href="/settings" className={styles.link}>Settings</Link>
            </div>
            <div className={styles.linkGroup}>
              <p className={styles.groupTitle}>Info</p>
              <Link href="/auth" className={styles.link}>Sign In</Link>
              <Link href="/auth?mode=signup" className={styles.link}>Create Account</Link>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copy}>© {new Date().getFullYear()} BulkThreads. All rights reserved.</p>
          <p className={styles.built}>Built with Supabase & Next.js</p>
        </div>
      </div>
    </footer>
  );
}
