import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.json();
  const { campaignId, userId, quantity, size, color } = body;

  if (!campaignId || !quantity) {
    return NextResponse.json({ error: 'campaignId and quantity are required.' }, { status: 400 });
  }

  // 1. Get campaign
  const { data: campaign, error: campaignErr } = await supabase
    .from('Campaign')
    .select('id, currentCount')
    .eq('id', campaignId)
    .single();

  if (campaignErr || !campaign) {
    return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
  }

  // 2. Insert order
  const { data: order, error: orderErr } = await supabase
    .from('Order')
    .insert([{ campaignId, userId: userId || 'anonymous', quantity, size, color }])
    .select()
    .single();

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });

  // 3. Increment campaign count
  const { error: updateErr } = await supabase
    .from('Campaign')
    .update({ currentCount: campaign.currentCount + parseInt(quantity) })
    .eq('id', campaignId);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json(order, { status: 201 });
}
