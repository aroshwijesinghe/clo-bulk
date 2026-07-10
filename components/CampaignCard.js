'use client';
import { motion } from 'framer-motion';
import styles from './CampaignCard.module.css';

export default function CampaignCard({ campaign, onClick }) {
  const progress = Math.min((campaign.currentCount / campaign.targetCount) * 100, 100);

  return (
    <motion.div 
      className={styles.card}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
    >
      <div className={styles.imageContainer}>
        {/* Placeholder image for now */}
        <div className={styles.imagePlaceholder}>
          <span>{campaign.title}</span>
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{campaign.title}</h3>
        <p className={styles.description}>{campaign.description}</p>
        <div className={styles.stats}>
          <span className={styles.price}>${campaign.price.toFixed(2)}</span>
          <span className={styles.count}>{campaign.currentCount} / {campaign.targetCount} ordered</span>
        </div>
        <div className={styles.progressBar}>
          <motion.div 
            className={styles.progressFill}
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
