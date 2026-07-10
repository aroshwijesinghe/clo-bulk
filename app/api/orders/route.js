import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { campaignId, userId, quantity, size, color } = body;

    // Create the order
    const order = await prisma.order.create({
      data: {
        campaignId,
        userId: userId || 'anonymous', // Placeholder until auth is added
        quantity,
        size,
        color,
      }
    });

    // Increment the campaign's current count
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        currentCount: {
          increment: quantity
        }
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}
