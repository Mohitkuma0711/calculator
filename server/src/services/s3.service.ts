import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import logger from '../utils/logger';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'voicedrop-audio-bucket';

/**
 * Generates a presigned URL for a user to upload an audio file directly to S3.
 * @param filename The unique name of the file to be uploaded.
 * @param contentType The MIME type of the file (e.g., 'audio/mp4').
 * @returns The presigned URL and the file key.
 */
export const generateUploadUrl = async (filename: string, contentType: string = 'audio/mp4') => {
  try {
    const key = `uploads/${Date.now()}_${filename}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry
    return { uploadUrl, key };
  } catch (error) {
    logger.error('Error generating S3 upload URL', error);
    throw new Error('Could not generate upload URL');
  }
};

/**
 * Generates a presigned URL to securely download/stream an audio file from S3.
 * @param key The S3 object key.
 * @returns The presigned download URL.
 */
export const generateDownloadUrl = async (key: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return downloadUrl;
  } catch (error) {
    logger.error('Error generating S3 download URL', error);
    throw new Error('Could not generate download URL');
  }
};
