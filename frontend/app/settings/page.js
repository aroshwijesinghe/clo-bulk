'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/components/ThemeProvider/ThemeProvider';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    campaignUpdates: true,
    orderShipped: true,
    newCampaigns: false,
    marketing: false,
  });

  useEffect(() => {
    if (!user) router.push('/auth');
  }, [user]);

  return (
    <div className={styles.page}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className={styles.pageHeader}>
            <p className="eyebrow">Preferences</p>
            <h1 className={styles.title}>Settings</h1>
          </div>

          {/* Appearance */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Appearance</h2>
            <div className={styles.settingRow}>
              <div>
                <p className={styles.settingLabel}>Theme</p>
                <p className={styles.settingDesc}>Currently using {theme} mode</p>
              </div>
              <button className={styles.themeToggle} onClick={toggleTheme}>
                <span className={styles.themeIcon}>{theme === 'dark' ? '🌙' : '☀️'}</span>
                <span className={styles.themeLabel}>{theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Notifications</h2>
            <div className={styles.settingList}>
              {Object.entries({
                campaignUpdates: 'Campaign progress updates',
                orderShipped: 'Order shipped & delivered',
                newCampaigns: 'New campaign alerts',
                marketing: 'Promotional emails',
              }).map(([key, label]) => (
                <div key={key} className={styles.settingRow}>
                  <div>
                    <p className={styles.settingLabel}>{label}</p>
                  </div>
                  <button
                    className={`${styles.toggle} ${notifications[key] ? styles.toggleOn : ''}`}
                    onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                    aria-checked={notifications[key]}
                    role="switch"
                  >
                    <span className={styles.toggleKnob} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Account */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Account</h2>
            <div className={styles.settingList}>
              <div className={styles.settingRow}>
                <div>
                  <p className={styles.settingLabel}>Email Address</p>
                  <p className={styles.settingDesc}>{user?.email}</p>
                </div>
                <span className={styles.badge}>Verified</span>
              </div>
              <div className={styles.settingRow}>
                <div>
                  <p className={styles.settingLabel}>Authentication</p>
                  <p className={styles.settingDesc}>JWT via Supabase Auth</p>
                </div>
                <span className={styles.badge}>Active</span>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className={`${styles.card} ${styles.dangerCard}`}>
            <h2 className={styles.cardTitle}>Danger Zone</h2>
            <div className={styles.settingRow}>
              <div>
                <p className={styles.settingLabel}>Sign Out</p>
                <p className={styles.settingDesc}>End your current session</p>
              </div>
              <button className={styles.dangerBtn} onClick={signOut}>Sign Out</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
