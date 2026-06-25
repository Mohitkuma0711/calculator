import { Router, Request, Response } from 'express';
import { verifyFirebaseIdToken } from '../services/otp.service';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { query } from '../db/client';
import logger from '../utils/logger';

const router = Router();

// POST /auth/send-otp
// Note: In Firebase Auth, sending the OTP is handled directly by the client SDK.
// This endpoint is just a placeholder if you ever switch to a custom SMS provider (like Twilio).
router.post('/send-otp', (req: Request, res: Response) => {
  res.status(200).json({ message: 'OTP sending is handled by Firebase client SDK.' });
});

// POST /auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ error: 'idToken is required' });
    return;
  }

  try {
    // 1. Verify token with Firebase
    const decodedToken = await verifyFirebaseIdToken(idToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      res.status(400).json({ error: 'Phone number not found in token' });
      return;
    }

    // 2. Check if user exists in our DB, if not, create them
    let userResult = await query('SELECT id, phone, username, avatar_url FROM users WHERE phone = $1', [phone]);
    
    let user;
    if (userResult.rows.length === 0) {
      // New user
      userResult = await query(
        'INSERT INTO users (phone) VALUES ($1) RETURNING id, phone, username, avatar_url',
        [phone]
      );
    }
    user = userResult.rows[0];

    // 3. Generate our own JWTs
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      message: 'Authentication successful',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Error in /verify-otp', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

export default router;
