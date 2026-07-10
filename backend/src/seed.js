import 'dotenv/config';
import { supabase } from '../lib/supabase.js';

const campaigns = [
  {
    title: 'Essential Premium Tee',
    description: 'High-quality organic cotton t-shirt with a perfect fit. Made from sustainably sourced materials, GOTS certified.',
    price: 12.99,
    targetCount: 100,
    currentCount: 85,
    status: 'active',
    imageUrl: null,
    endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
  {
    title: 'Heavyweight Hoodie',
    description: 'Ultra-soft 400gsm heavyweight hoodie for the winter season. Dropped shoulders, brushed fleece lining, kangaroo pocket.',
    price: 34.50,
    targetCount: 50,
    currentCount: 20,
    status: 'active',
    imageUrl: null,
    endDate: new Date(Date.now() + 14 * 86400000).toISOString(),
  },
  {
    title: 'Athletic Joggers',
    description: 'Comfortable and stylish joggers for workouts or lounging. 4-way stretch fabric, deep side pockets, tapered ankle.',
    price: 22.00,
    targetCount: 200,
    currentCount: 195,
    status: 'active',
    imageUrl: null,
    endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
  },
  {
    title: 'Classic Oxford Shirt',
    description: 'Timeless Oxford weave shirt in a relaxed fit. Perfect for smart-casual outfits. Wrinkle-resistant, breathable.',
    price: 27.50,
    targetCount: 75,
    currentCount: 10,
    status: 'active',
    imageUrl: null,
    endDate: new Date(Date.now() + 21 * 86400000).toISOString(),
  },
  {
    title: 'Cargo Shorts',
    description: 'Durable multi-pocket cargo shorts with a modern tapered fit. Water-resistant ripstop nylon, zip security pocket.',
    price: 18.00,
    targetCount: 150,
    currentCount: 60,
    status: 'active',
    imageUrl: null,
    endDate: new Date(Date.now() + 10 * 86400000).toISOString(),
  },
  {
    title: 'Merino Wool Socks 3-Pack',
    description: 'Premium Merino wool socks — warm in winter, cool in summer. Cushioned sole, seamless toe, anti-blister design.',
    price: 9.99,
    targetCount: 300,
    currentCount: 212,
    status: 'active',
    imageUrl: null,
    endDate: new Date(Date.now() + 5 * 86400000).toISOString(),
  },
];

async function seed() {
  console.log('🌱 Seeding database via Supabase...');

  // Delete all orders first (foreign key constraint)
  const { error: delOrders } = await supabase
    .from('Order')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (delOrders) console.warn('⚠️  Orders clear:', delOrders.message);

  // Delete all campaigns
  const { error: delCampaigns } = await supabase
    .from('Campaign')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (delCampaigns) console.warn('⚠️  Campaigns clear:', delCampaigns.message);

  // Insert campaigns
  const { data, error } = await supabase.from('Campaign').insert(campaigns).select();

  if (error) {
    console.error('❌ Seed failed:', error.message);
    console.error('Hint: Make sure you have run the schema.sql in your Supabase SQL Editor first.');
    process.exit(1);
  }

  console.log(`✅ Seeded ${data.length} campaigns successfully:`);
  data.forEach((c) => console.log(`   • ${c.title} (${c.currentCount}/${c.targetCount})`));
  process.exit(0);
}

seed();
