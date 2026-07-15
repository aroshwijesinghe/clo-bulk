'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import CampaignCard from '@/components/CampaignCard/CampaignCard';
import HowItWorks from '@/components/HowItWorks/HowItWorks';
import CampaignModal from '@/components/CampaignModal/CampaignModal';
import { AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

// Antigravity Components
import GlassCard from '@/components/GlassCard';
import IsometricGrid from '@/components/IsometricGrid';

export default function HomePage() {
  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('Campaign').select('*').eq('status', 'active')
      .order('currentCount', { ascending: false }).limit(6)
      .then(({ data }) => { setCampaigns(data || []); setLoading(false); });
  }, []);

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.heroBlob1} />
          <div className={styles.heroBlob2} />
          <div className={styles.heroGrid} />
        </div>
        <div className="container">
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className={styles.heroBadge}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              ✦ Group Buying, Reimagined
            </motion.div>

            <h1 className={styles.heroTitle}>
              Premium Clothing
              <br />
              <span className={styles.heroAccent}>Wholesale Prices.</span>
            </h1>

            <p className={styles.heroSubtitle}>
              Join bulk order campaigns. When enough people commit, everyone
              unlocks the wholesale price — no middlemen, no markups.
            </p>

            <div className={styles.heroActions}>
              <Link href="/campaigns" className="btn-primary">
                Explore Campaigns →
              </Link>
              <Link href="/campaigns/create" className="btn-ghost">
                Start a Campaign
              </Link>
            </div>

            <GlassCard className="mt-12 p-6 max-w-3xl mx-auto backdrop-blur-md bg-white/5 border-white/10" tilt>
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatNum}>{campaigns.length > 0 ? `${campaigns.length}+` : '—'}</span>
                  <span className={styles.heroStatLabel}>Active Campaigns</span>
                </div>
                <div className={styles.heroStatDivider} />
                <div className={styles.heroStat}>
                  <span className={styles.heroStatNum}>40%</span>
                  <span className={styles.heroStatLabel}>Avg. Savings</span>
                </div>
                <div className={styles.heroStatDivider} />
                <div className={styles.heroStat}>
                  <span className={styles.heroStatNum}>100%</span>
                  <span className={styles.heroStatLabel}>Satisfaction</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Live Campaigns */}
      <section className={styles.section}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="eyebrow">Live Now</p>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Active Campaigns</h2>
              <Link href="/campaigns" className={styles.viewAll}>View All →</Link>
            </div>
          </motion.div>

          {loading ? (
            <div className={styles.grid}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`${styles.skeletonCard} skeleton`} />
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <IsometricGrid items={campaigns.slice(0, 3).map((c) => (
              <GlassCard key={c.id} tilt className="h-full w-full">
                <CampaignCard campaign={c} onClick={() => setSelected(c)} />
              </GlassCard>
            ))} />
          ) : (
            <div className={styles.emptyCampaigns}>
              <p>No active campaigns yet.</p>
              <Link href="/campaigns/create" className="btn-primary">Start the First One</Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      <AnimatePresence>
        {selected && (
          <CampaignModal campaign={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
