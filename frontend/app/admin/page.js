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
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading...</p>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', paddingTop: '110px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          Welcome, Admin. System overview and management controls.
        </p>
        
        <div style={{ padding: '2.5rem', background: 'var(--surface)', borderRadius: '30px', boxShadow: 'var(--neu-shadow-raised)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-primary)' }}>System Overview</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem' }}>
            Administrative controls for campaign moderation, user authentication verification, order auditing, and platform settings.
          </p>
          <div style={{ marginTop: '2.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
             <div style={{ padding: '1.8rem', background: 'var(--surface)', boxShadow: 'var(--neu-shadow-inset)', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '4px' }}>---</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Campaigns</div>
             </div>
             <div style={{ padding: '1.8rem', background: 'var(--surface)', boxShadow: 'var(--neu-shadow-inset)', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '4px' }}>---</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Orders</div>
             </div>
             <div style={{ padding: '1.8rem', background: 'var(--surface)', boxShadow: 'var(--neu-shadow-inset)', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '4px' }}>---</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Users</div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
