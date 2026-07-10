'use client';
import { motion } from 'framer-motion';
import CampaignCard from '@/components/CampaignCard';
import styles from './page.module.css';

const DUMMY_CAMPAIGNS = [
  {
    id: '1',
    title: 'Essential Premium Tee',
    description: 'High-quality organic cotton t-shirt with a perfect fit. Get it at wholesale price.',
    price: 12.99,
    targetCount: 100,
    currentCount: 85,
  },
  {
    id: '2',
    title: 'Heavyweight Hoodie',
    description: 'Ultra-soft, 400gsm heavyweight hoodie for the winter season.',
    price: 34.50,
    targetCount: 50,
    currentCount: 20,
  },
  {
    id: '3',
    title: 'Athletic Joggers',
    description: 'Comfortable and stylish joggers suitable for workouts or lounging.',
    price: 22.00,
    targetCount: 200,
    currentCount: 195,
  },
];

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">
          <motion.div 
            className={styles.heroContent}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className={styles.heroTitle}>
              Unlock Wholesale Prices <br /> <span className={styles.heroAccent}>Together.</span>
            </h1>
            <p className={styles.heroDescription}>
              Join group buying campaigns for premium clothing. When the goal is met, everyone gets the bulk order discount.
            </p>
            <motion.button 
              className={styles.ctaButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Campaigns
            </motion.button>
          </motion.div>
        </div>
      </section>

      <section id="campaigns" className={styles.campaignsSection}>
        <div className="container">
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Trending Campaigns
          </motion.h2>
          <div className={styles.grid}>
            {DUMMY_CAMPAIGNS.map((campaign, i) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <CampaignCard campaign={campaign} onClick={() => {}} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
