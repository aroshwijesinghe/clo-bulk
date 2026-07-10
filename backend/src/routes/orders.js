import { Router } from 'express';
import { supabase } from '../../lib/supabase.js';

const router = Router();

// POST /api/orders — join a campaign (place an order)
router.post('/', async (req, res, next) => {
  try {
    const { campaignId, userId, quantity, size, color } = req.body;

    if (!campaignId || !quantity) {
      return res.status(400).json({ error: 'campaignId and quantity are required.' });
    }

    // 1. Check campaign exists
    const { data: campaign, error: campaignErr } = await supabase
      .from('Campaign')
      .select('id, currentCount, targetCount')
      .eq('id', campaignId)
      .single();

    if (campaignErr || !campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    // 2. Insert the order
    const { data: order, error: orderErr } = await supabase
      .from('Order')
      .insert([{
        campaignId,
        userId: userId || 'anonymous', // Placeholder until Google Auth is added
        quantity: parseInt(quantity),
        size: size || null,
        color: color || null,
      }])
      .select()
      .single();

    if (orderErr) throw orderErr;

    // 3. Increment campaign currentCount
    const newCount = campaign.currentCount + parseInt(quantity);
    const { error: updateErr } = await supabase
      .from('Campaign')
      .update({ currentCount: newCount, updatedAt: new Date().toISOString() })
      .eq('id', campaignId);

    if (updateErr) throw updateErr;

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders — list all orders (admin)
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('Order')
      .select('*, Campaign(title, price)')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id — get a specific order
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('Order')
      .select('*, Campaign(*)')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Order not found.' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
