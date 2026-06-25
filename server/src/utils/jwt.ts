import jwt from 'jsonwebtoken';
import logger from './logger';

const JWT_SECRET = process.env.JWT_SECRET || 'default_dev_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_dev_refresh_secret';

export interface TokenPayload {
  userId: string;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    logger.error('Invalid or expired access token', error);
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    logger.error('Invalid or expired refresh token', error);
    return null;
  }
};
