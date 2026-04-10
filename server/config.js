import dotenv from 'dotenv';
dotenv.config();

export default {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  nodeEnv: process.env.NODE_ENV || 'development',
  dbPath: process.env.DB_PATH || './db/ehr.db',
};
