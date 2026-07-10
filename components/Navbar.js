'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <motion.header 
      className={styles.header}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          BulkThreads
        </Link>
        <nav className={styles.nav}>
          <Link href="#campaigns" className={styles.navLink}>Campaigns</Link>
          <Link href="#how-it-works" className={styles.navLink}>How it Works</Link>
          {/* Placeholder for Google Auth */}
          <button className={styles.loginBtn}>Sign In</button>
        </nav>
      </div>
    </motion.header>
  );
}
