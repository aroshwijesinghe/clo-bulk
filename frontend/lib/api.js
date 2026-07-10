/**
 * lib/api.js
 * Centralised API helper for all backend calls.
 * All requests go to NEXT_PUBLIC_API_URL (proxied via next.config.mjs).
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `API Error: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── Campaigns ───────────────────────────────────────────────
export const getCampaigns = () => request('/api/campaigns');
export const getCampaign = (id) => request(`/api/campaigns/${id}`);
export const createCampaign = (data) =>
  request('/api/campaigns', { method: 'POST', body: JSON.stringify(data) });

// ─── Orders ─────────────────────────────────────────────────
export const placeOrder = (data) =>
  request('/api/orders', { method: 'POST', body: JSON.stringify(data) });
