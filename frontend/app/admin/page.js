'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function AdminDashboard() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace('/');
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Welcome, Admin. This is a protected view.
        </p>
        
        <div style={{ padding: '2rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--accent)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>System Overview</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This is a placeholder for admin controls like campaign management, user moderation, order tracking, and system settings.
          </p>
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
             <div style={{ padding: '1rem', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>---</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Campaigns</div>
             </div>
             <div style={{ padding: '1rem', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>---</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Active Orders</div>
             </div>
             <div style={{ padding: '1rem', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>---</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Users</div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
