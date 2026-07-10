'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './CampaignModal.module.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const IMAGE_MAP = {
  tee:     '/images/tee.png',
  hoodie:  '/images/hoodie.png',
  jogger:  '/images/joggers.png',
  oxford:  '/images/oxford.png',
  cargo:   '/images/cargo.png',
  sock:    '/images/socks.png',
};

function getImages(campaign) {
  if (campaign.imageUrl) {
    return campaign.imageUrl.split(',').map(s => s.trim()).filter(Boolean);
  }
  const t = campaign.title.toLowerCase();
  for (const [k, v] of Object.entries(IMAGE_MAP)) {
    if (t.includes(k)) return [v];
  }
  return [];
}

export default function CampaignModal({ campaign, onClose, onOrderPlaced }) {
  const { user } = useAuth();
  const router = useRouter();
  const [size, setSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const progress = Math.min(Math.round((campaign.currentCount / campaign.targetCount) * 100), 100);
  const remaining = campaign.targetCount - campaign.currentCount;
  
  const images = getImages(campaign);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };
  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleJoin = async () => {
    if (!user) { router.push('/auth'); return; }
    if (quantity > remaining) {
      setError(`Only ${remaining} spots left.`);
      return;
    }
    
    setLoading(true);
    setError('');
    const { error } = await supabase.from('Order').insert([{
      campaignId: campaign.id,
      userId: user.id,
      quantity,
      size,
    }]);
    if (error) {
      setError(error.message);
    } else {
      // Update currentCount
      await supabase
        .from('Campaign')
        .update({ currentCount: campaign.currentCount + quantity })
        .eq('id', campaign.id);
      setSuccess(true);
      onOrderPlaced?.();
    }
    setLoading(false);
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        {/* Image */}
        <div className={styles.imageWrap}>
          {images.length > 0 ? (
            <>
              <Image key={currentImageIdx} src={images[currentImageIdx]} alt={campaign.title} fill style={{ objectFit: 'cover' }} />
              {images.length > 1 && (
                <>
                  <button className={`${styles.carouselArrow} ${styles.carouselLeft}`} onClick={prevImage}>←</button>
                  <button className={`${styles.carouselArrow} ${styles.carouselRight}`} onClick={nextImage}>→</button>
                  <div className={styles.carouselDots}>
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`${styles.dot} ${idx === currentImageIdx ? styles.dotActive : ''}`}
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(idx); }}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className={styles.imageFallback}>
              <span>{campaign.title[0]}</span>
            </div>
          )}
          <div className={styles.imageOverlay} />
          <div className={styles.imagePrice}>${campaign.price.toFixed(2)} <span>/ unit</span></div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div>
            <h2 className={styles.title}>{campaign.title}</h2>
            <p className={styles.description}>{campaign.description}</p>
          </div>

          {/* Progress */}
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span>{campaign.currentCount} joined</span>
              <span>{remaining > 0 ? `${remaining} spots left` : '🎉 Goal reached!'}</span>
            </div>
            <div className={styles.progressTrack}>
              <motion.div
                className={styles.progressBar}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <div className={styles.progressFooter}>
              <span>{progress}% of {campaign.targetCount} target</span>
              <span>Ends {new Date(campaign.endDate).toLocaleDateString()}</span>
            </div>
          </div>

          {!success ? (
            <div className={styles.orderSection}>
              {/* Size */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Select Size</label>
                <div className={styles.sizes}>
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      className={`${styles.sizeBtn} ${size === s ? styles.sizeActive : ''}`}
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Quantity</label>
                <div className={styles.qtyRow}>
                  <button className={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span className={styles.qtyNum}>{quantity}</span>
                  <button className={styles.qtyBtn} onClick={() => setQuantity(Math.min(remaining, quantity + 1))}>+</button>
                  <span className={styles.qtyTotal}>= ${(campaign.price * quantity).toFixed(2)}</span>
                </div>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <motion.button
                className={styles.joinBtn}
                onClick={handleJoin}
                disabled={loading || progress >= 100}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className={styles.spinner} />
                ) : progress >= 100 ? (
                  'Campaign Full'
                ) : user ? (
                  `Join for $${(campaign.price * quantity).toFixed(2)}`
                ) : (
                  'Sign In to Join'
                )}
              </motion.button>
            </div>
          ) : (
            <motion.div
              className={styles.successPanel}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className={styles.successIcon}>🎉</span>
              <h3>You're In!</h3>
              <p>Your order for {quantity}× {campaign.title} (Size {size}) has been placed.</p>
              <button className={styles.viewOrdersBtn} onClick={() => router.push('/orders')}>
                View My Orders
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
