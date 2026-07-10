import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const campaign = await prisma.campaign.create({
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        targetCount: body.targetCount,
        endDate: new Date(body.endDate),
        imageUrl: body.imageUrl,
      }
    });
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
