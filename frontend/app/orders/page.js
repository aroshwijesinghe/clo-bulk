'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from './orders.module.css';

const STATUS_COLOR = {
  pending:   { bg: 'var(--warning-muted)', color: 'var(--warning)' },
  confirmed: { bg: 'var(--accent-glow)',   color: 'var(--accent-light)' },
  shipped:   { bg: 'rgba(16,185,129,0.08)', color: 'var(--success)' },
  delivered: { bg: 'var(--success-muted)', color: 'var(--success)' },
  cancelled: { bg: 'var(--danger-muted)',  color: 'var(--danger)' },
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth'); return; }
    if (user) fetchOrders();
  }, [user, authLoading]);

  async function fetchOrders() {
    const { data } = await supabase
      .from('Order')
      .select('*, Campaign(title, price, imageUrl)')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <div className={styles.page}>
        <div className="container">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`${styles.skeletonRow} skeleton`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className={styles.pageHeader}>
            <div>
              <p className="eyebrow">My Activity</p>
              <h1 className={styles.title}>My Orders</h1>
            </div>
            <Link href="/campaigns" className={styles.browsBtn}>Browse Campaigns →</Link>
          </div>

          {orders.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📦</span>
              <h3>No Orders Yet</h3>
              <p>Join a bulk order campaign to see your orders here.</p>
              <Link href="/campaigns" className="btn-primary" style={{ marginTop: '1rem' }}>
                Explore Campaigns
              </Link>
            </div>
          ) : (
            <div className={styles.list}>
              {orders.map((order, i) => {
                const sc = STATUS_COLOR[order.status] || STATUS_COLOR.pending;
                return (
                  <motion.div
                    key={order.id}
                    className={styles.row}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <div className={styles.rowLeft}>
                      <div className={styles.rowIcon}>🧺</div>
                      <div>
                        <p className={styles.rowTitle}>{order.Campaign?.title}</p>
                        <p className={styles.rowMeta}>
                          Qty: {order.quantity} · Size: {order.size || 'N/A'} ·{' '}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={styles.rowRight}>
                      <span
                        className={styles.statusBadge}
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {order.status}
                      </span>
                      <span className={styles.rowPrice}>
                        ${((order.Campaign?.price || 0) * order.quantity).toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
