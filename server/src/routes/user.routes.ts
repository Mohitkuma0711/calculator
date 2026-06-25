import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { query } from '../db/client';
import logger from '../utils/logger';

const router = Router();

// GET /users/me - Get own profile
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const result = await query(
      'SELECT id, phone, username, bio, avatar_url, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching user profile', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /users/me - Update profile
router.patch('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { username, bio, avatar_url } = req.body;

    // Build dynamic query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      values.push(username);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(bio);
    }
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(avatar_url);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No valid fields provided for update' });
      return;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId); // the last param is the ID

    const queryText = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, username, bio, avatar_url`;
    
    const result = await query(queryText, values);
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error updating profile', error);
    if (error.code === '23505') { // unique_violation
      res.status(409).json({ error: 'Username already taken' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/:id - Get any user's public profile
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Using simple regex to check basic UUID format
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
      res.status(400).json({ error: 'Invalid user ID format' });
      return;
    }

    // Public profile shouldn't include sensitive info like phone number
    const result = await query(
      'SELECT id, username, bio, avatar_url, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching public user profile', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
