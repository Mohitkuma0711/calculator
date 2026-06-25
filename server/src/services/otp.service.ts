import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-adminsdk.json';
const absolutePath = path.resolve(serviceAccountPath);

try {
  if (fs.existsSync(absolutePath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    logger.info('Firebase Admin initialized successfully');
  } else {
    logger.warn(`Firebase Admin SDK JSON not found at ${absolutePath}. OTP verification will fail until this is provided.`);
    // Initialize without credentials for build purposes, will throw on usage
    admin.initializeApp();
  }
} catch (error) {
  logger.error('Error initializing Firebase Admin', error);
}

export const verifyFirebaseIdToken = async (idToken: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    logger.error('Error verifying Firebase ID token', error);
    throw new Error('Invalid Firebase token');
  }
};
