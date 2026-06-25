import dotenv from 'dotenv';
dotenv.config();

import { getClient, query } from '../src/db/client';
import redis from '../src/db/redis';
import logger from '../src/utils/logger';

async function testConnections() {
  let client;
  try {
    // 1. Test PostgreSQL
    client = await getClient();
    logger.info('✅ Successfully connected to PostgreSQL');
    
    // Test basic query
    const res = await query('SELECT NOW() as current_time');
    logger.info(`PostgreSQL current time: ${res.rows[0].current_time}`);

    // 2. Test Redis
    await redis.set('test_key', 'Hello VoiceDrop!');
    const val = await redis.get('test_key');
    if (val === 'Hello VoiceDrop!') {
      logger.info('✅ Successfully connected to Redis and performed SET/GET');
    } else {
      logger.error('❌ Redis validation failed');
    }

  } catch (error) {
    logger.error('❌ Error testing connections', error);
  } finally {
    if (client) client.release();
    redis.disconnect();
    process.exit(0);
  }
}

testConnections();
