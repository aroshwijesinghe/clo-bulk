'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from './create.module.css';

export default function CreateCampaignPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    targetCount: '',
    endDate: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className={styles.gateWrap}>
        <div className={styles.gate}>
          <span className={styles.gateIcon}>🔒</span>
          <h2>Sign in to Start a Campaign</h2>
          <p>Create a bulk order campaign and gather people to unlock wholesale prices.</p>
          <button className="btn-primary" onClick={() => router.push('/auth')}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.from('Campaign').insert([{
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      targetCount: parseInt(form.targetCount),
      endDate: new Date(form.endDate).toISOString(),
      imageUrl: form.imageUrl || null,
      currentCount: 0,
      status: 'active',
      createdBy: user.id,
    }]).select().single();

    if (error) {
      setError(error.message);
    } else {
      router.push('/campaigns');
    }
    setLoading(false);
  };

  const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div className={styles.page}>
      <div className="container">
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.header}>
            <p className="eyebrow">New Campaign</p>
            <h1 className={styles.title}>Start a Bulk Order</h1>
            <p className={styles.subtitle}>
              Set your target quantity and price. Once the goal is reached, everyone saves.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.grid}>
              {/* Title */}
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label className={styles.label}>Campaign Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="e.g. Premium Heavyweight Hoodie"
                  required
                />
              </div>

              {/* Description */}
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label className={styles.label}>Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="Describe the product, material, quality, delivery info..."
                  rows={4}
                  required
                />
              </div>

              {/* Price */}
              <div className={styles.field}>
                <label className={styles.label}>Price Per Unit ($) *</label>
                <input
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="e.g. 24.99"
                  required
                />
              </div>

              {/* Target */}
              <div className={styles.field}>
                <label className={styles.label}>Target Quantity *</label>
                <input
                  name="targetCount"
                  type="number"
                  min="2"
                  value={form.targetCount}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="e.g. 100"
                  required
                />
              </div>

              {/* End date */}
              <div className={styles.field}>
                <label className={styles.label}>Campaign End Date *</label>
                <input
                  name="endDate"
                  type="date"
                  min={minDate}
                  value={form.endDate}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>

              {/* Image URL */}
              <div className={styles.field}>
                <label className={styles.label}>Image URL (optional)</label>
                <input
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Preview card */}
            {form.title && form.price && form.targetCount && (
              <motion.div
                className={styles.preview}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <p className={styles.previewLabel}>📦 Campaign Preview</p>
                <p className={styles.previewTitle}>{form.title}</p>
                <p className={styles.previewMeta}>
                  ${parseFloat(form.price || 0).toFixed(2)} / unit · Target: {form.targetCount} units
                </p>
              </motion.div>
            )}

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button type="button" onClick={() => router.back()} className={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : '🚀 Launch Campaign'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
