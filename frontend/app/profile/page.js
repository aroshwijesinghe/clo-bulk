'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState({ displayName: '', bio: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    const { data } = await supabase
      .from('Profile')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) setProfile({ displayName: data.displayName || '', bio: data.bio || '', phone: data.phone || '', address: data.address || '' });
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('Profile')
      .upsert({ id: user.id, ...profile, updatedAt: new Date().toISOString() });
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  }

  const initial = (profile.displayName || user?.email || '?')[0].toUpperCase();

  if (loading) return <div className={styles.loadingPage}><div className="skeleton" style={{ width: 200, height: 200, borderRadius: '50%', margin: '0 auto' }} /></div>;

  return (
    <div className={styles.page}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Profile Header */}
          <div className={styles.heroCard}>
            <div className={styles.avatarLg}>{initial}</div>
            <div>
              <h1 className={styles.name}>{profile.displayName || 'Your Profile'}</h1>
              <p className={styles.email}>{user?.email}</p>
              <p className={styles.joined}>Member since {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Edit form */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Edit Profile</h2>
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label className={styles.label}>Display Name</label>
                  <input className={styles.input} value={profile.displayName} onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))} placeholder="Your name" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Phone</label>
                  <input className={styles.input} value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" />
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>Bio</label>
                  <textarea className={styles.textarea} value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell others a bit about yourself..." rows={3} />
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>Shipping Address</label>
                  <input className={styles.input} value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} placeholder="123 Main St, City, Country" />
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? '...' : saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Danger zone */}
          <div className={`${styles.card} ${styles.dangerCard}`}>
            <h2 className={styles.cardTitle}>Account</h2>
            <div className={styles.dangerRow}>
              <div>
                <p className={styles.dangerLabel}>Sign Out</p>
                <p className={styles.dangerDesc}>Sign out from all devices</p>
              </div>
              <button className={styles.signOutBtn} onClick={signOut}>Sign Out</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
