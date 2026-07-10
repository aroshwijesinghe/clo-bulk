import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Use service role key on the server — never expose this to the browser
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from('Campaign')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const body = await request.json();
  const { title, description, price, targetCount, endDate, imageUrl } = body;

  if (!title || !description || !price || !targetCount || !endDate) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('Campaign')
    .insert([{ title, description, price, targetCount, endDate, imageUrl, currentCount: 0 }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
