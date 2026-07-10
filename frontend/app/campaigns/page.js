'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import CampaignCard from '@/components/CampaignCard/CampaignCard';
import CampaignModal from '@/components/CampaignModal/CampaignModal';
import styles from './campaigns.module.css';

const FILTERS = ['All', 'Active', 'Almost Full', 'Completed'];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [campaigns, activeFilter, search]);

  async function fetchCampaigns() {
    setLoading(true);
    const { data, error } = await supabase
      .from('Campaign')
      .select('*')
      .order('createdAt', { ascending: false });
    if (!error) setCampaigns(data || []);
    setLoading(false);
  }

  function applyFilters() {
    let result = [...campaigns];
    if (search) {
      result = result.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (activeFilter === 'Active') {
      result = result.filter((c) => c.status === 'active' && (c.currentCount / c.targetCount) < 0.8);
    } else if (activeFilter === 'Almost Full') {
      result = result.filter((c) => (c.currentCount / c.targetCount) >= 0.8 && c.currentCount < c.targetCount);
    } else if (activeFilter === 'Completed') {
      result = result.filter((c) => c.currentCount >= c.targetCount || c.status === 'completed');
    }
    setFiltered(result);
  }

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    almostFull: campaigns.filter((c) => (c.currentCount / c.targetCount) >= 0.8 && c.currentCount < c.targetCount).length,
  };

  return (
    <div className={styles.page}>
      {/* Hero header */}
      <div className={styles.hero}>
        <div className="container">
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="eyebrow">Live Group Buys</p>
            <h1 className={styles.heroTitle}>Bulk Order Campaigns</h1>
            <p className={styles.heroSubtitle}>
              Join a campaign, hit the goal, unlock wholesale pricing together.
            </p>

            {/* Stats */}
            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <span className={styles.statNum}>{stats.total}</span>
                <span className={styles.statLabel}>Total Campaigns</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNum}>{stats.active}</span>
                <span className={styles.statLabel}>Active Now</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNum}>{stats.almostFull}</span>
                <span className={styles.statLabel}>Almost Full</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container">
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="search"
              className={styles.search}
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filters}>
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${activeFilter === f ? styles.filterActive : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {user && (
            <button
              onClick={() => router.push('/campaigns/create')}
              className={styles.createBtn}
            >
              + Start Campaign
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`${styles.skeletonCard} skeleton`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div className={styles.empty}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className={styles.emptyIcon}>🎯</span>
            <h3>No campaigns found</h3>
            <p>Try a different filter or <button onClick={() => router.push('/campaigns/create')} className={styles.emptyAction}>start one yourself</button></p>
          </motion.div>
        ) : (
          <motion.div
            className={styles.grid}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={activeFilter + search}
          >
            {filtered.map((campaign) => (
              <motion.div key={campaign.id} variants={itemVariants}>
                <CampaignCard
                  campaign={campaign}
                  onClick={() => setSelectedCampaign(campaign)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <CampaignModal
            campaign={selectedCampaign}
            onClose={() => setSelectedCampaign(null)}
            onOrderPlaced={fetchCampaigns}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
