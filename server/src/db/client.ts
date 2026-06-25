import { Pool } from 'pg';
import logger from '../utils/logger';

// When running locally, if DB_URL isn't provided, we fall back to individual params
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'voicedrop',
  // You can also use connectionString: process.env.DB_URL
});

pool.on('connect', () => {
  logger.debug('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getClient = () => pool.connect();

export default pool;
