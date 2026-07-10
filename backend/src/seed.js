import 'dotenv/config';
import { supabase } from '../lib/supabase.js';

const campaigns = [
  {
    title: 'Essential Premium Tee',
    description: 'High-quality organic cotton t-shirt with a perfect fit. Made from sustainably sourced materials.',
    price: 12.99,
    targetCount: 100,
    currentCount: 85,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Heavyweight Hoodie',
    description: 'Ultra-soft, 400gsm heavyweight hoodie for the winter season. Dropped shoulders and fleece lining.',
    price: 34.50,
    targetCount: 50,
    currentCount: 20,
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Athletic Joggers',
    description: 'Comfortable and stylish joggers suitable for workouts or lounging. 4-way stretch fabric.',
    price: 22.00,
    targetCount: 200,
    currentCount: 195,
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Classic Oxford Shirt',
    description: 'Timeless Oxford weave shirt in a relaxed fit. Perfect for smart-casual outfits.',
    price: 27.50,
    targetCount: 75,
    currentCount: 10,
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Cargo Shorts',
    description: 'Durable multi-pocket cargo shorts with a modern tapered fit. Water-resistant ripstop nylon.',
    price: 18.00,
    targetCount: 150,
    currentCount: 60,
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Merino Wool Socks 3-Pack',
    description: 'Premium Merino wool socks — warm in winter, cool in summer. Cushioned sole, seamless toe.',
    price: 9.99,
    targetCount: 300,
    currentCount: 212,
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

async function seed() {
  console.log('🌱 Seeding database via Supabase...');

  // Clear existing data (orders first due to foreign key)
  const { error: delOrders } = await supabase.from('Order').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delOrders) console.warn('⚠️  Could not clear orders:', delOrders.message);

  const { error: delCampaigns } = await supabase.from('Campaign').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delCampaigns) console.warn('⚠️  Could not clear campaigns:', delCampaigns.message);

  // Insert campaigns
  const { data, error } = await supabase.from('Campaign').insert(campaigns).select();

  if (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`✅ Seeded ${data.length} campaigns successfully.`);
  process.exit(0);
}

seed();
