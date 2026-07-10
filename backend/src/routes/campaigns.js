import { Router } from 'express';
import { supabase } from '../../lib/supabase.js';

const router = Router();

// GET /api/campaigns — list all campaigns (newest first)
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('Campaign')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/campaigns/:id — get a single campaign with its orders
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('Campaign')
      .select('*, Order(*)')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Campaign not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/campaigns — create a new campaign
router.post('/', async (req, res, next) => {
  try {
    const { title, description, price, targetCount, endDate, imageUrl } = req.body;

    if (!title || !description || !price || !targetCount || !endDate) {
      return res.status(400).json({ error: 'Missing required fields: title, description, price, targetCount, endDate.' });
    }

    const { data, error } = await supabase
      .from('Campaign')
      .insert([{
        title,
        description,
        price: parseFloat(price),
        targetCount: parseInt(targetCount),
        endDate: new Date(endDate).toISOString(),
        imageUrl: imageUrl || null,
        currentCount: 0,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/campaigns/:id — update a campaign
router.patch('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('Campaign')
      .update({ ...req.body, updatedAt: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/campaigns/:id — delete a campaign
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('Campaign')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
