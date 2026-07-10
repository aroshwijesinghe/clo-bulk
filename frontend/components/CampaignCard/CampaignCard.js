'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './CampaignCard.module.css';

// Map campaign titles to local product images
const IMAGE_MAP = {
  'essential premium tee':   '/images/tee.png',
  'heavyweight hoodie':       '/images/hoodie.png',
  'athletic joggers':         '/images/joggers.png',
  'classic oxford shirt':     '/images/oxford.png',
  'cargo shorts':             '/images/cargo.png',
  'merino wool socks 3-pack': '/images/socks.png',
};

function getImages(campaign) {
  if (campaign.imageUrl) {
    return campaign.imageUrl.split(',').map(s => s.trim()).filter(Boolean);
  }
  const key = campaign.title.toLowerCase();
  for (const [k, v] of Object.entries(IMAGE_MAP)) {
    if (key.includes(k.split(' ')[0])) return [v];
  }
  return [];
}

export default function CampaignCard({ campaign, onClick }) {
  const progress = Math.min(Math.round((campaign.currentCount / campaign.targetCount) * 100), 100);
  const isAlmostFull = progress >= 80 && progress < 100;
  const isFull = progress >= 100;
  const endDate = new Date(campaign.endDate);
  const daysLeft = Math.max(0, Math.ceil((endDate - Date.now()) / 86400000));
  
  const images = getImages(campaign);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const image = images[currentImageIdx] || null;

  let accentColor = 'var(--accent)';
  if (isAlmostFull) accentColor = 'var(--warning)';
  if (isFull) accentColor = 'var(--success)';

  return (
    <motion.article
      className={styles.card}
      whileHover={{ y: -6, scale: 1.012 }}
      transition={{ type: 'spring', stiffness: 350, damping: 26 }}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`View campaign: ${campaign.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Image */}
      <div className={styles.imageWrap}>
        {image ? (
          <motion.div
            key={currentImageIdx}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
          >
            <Image
              src={image}
              alt={campaign.title}
              fill
              className={styles.image}
              sizes="(max-width: 600px) 100vw, 340px"
              style={{ objectFit: 'cover' }}
            />
          </motion.div>
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>{campaign.title[0]}</span>
          </div>
        )}
        <div className={styles.imageOverlay} />

        {/* Badges */}
        {isFull && <span className={`${styles.badge} ${styles.badgeFull}`}>✅ Goal Reached</span>}
        {isAlmostFull && <span className={`${styles.badge} ${styles.badgeHot}`}>🔥 Almost Full</span>}

        {/* Price chip */}
        <span className={styles.priceChip}>${campaign.price.toFixed(2)}</span>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{campaign.title}</h3>
        <p className={styles.desc}>{campaign.description}</p>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            👥 {campaign.currentCount}/{campaign.targetCount}
          </span>
          <span className={styles.metaItem}>
            ⏱ {daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}
          </span>
        </div>

        {/* Progress */}
        <div className={styles.progressTrack}>
          <motion.div
            className={styles.progressBar}
            style={{ background: accentColor }}
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          />
        </div>
        <span className={styles.progressText}>{progress}% funded</span>

        <motion.button
          className={`${styles.joinBtn} ${isFull ? styles.joinFull : ''}`}
          style={!isFull ? { background: accentColor === 'var(--accent)' ? 'var(--accent)' : accentColor } : {}}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={(e) => { e.stopPropagation(); onClick?.(); }}
        >
          {isFull ? 'View Details' : 'Join Campaign →'}
        </motion.button>
      </div>
    </motion.article>
  );
}
