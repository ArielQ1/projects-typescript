import dotenv from 'dotenv'
import { DatabaseConfig, EnvConfig } from '../types/index.js'

dotenv.config()

const parseEnvNumber = (value: string | undefined, defaultValue: number): number => {
  const parsed = parseInt(value || '', 10)
  return isNaN(parsed) ? defaultValue : parsed
}

const parseEnvArray = (value: string | undefined, defaultValue: string[]): string[] => {
  if (!value) return defaultValue
  return value.split(',').map(item => item.trim())
}

export const config: EnvConfig = {
  JWT_SECRET: process.env.JWT_SECRET || 'this-is-a-secret-key_change-me-please',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  PORT: parseEnvNumber(process.env.PORT, 3000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  SALT_ROUNDS: parseEnvNumber(process.env.SALT_ROUNDS, 12),
  ID_ROLE_ADMIN: process.env.ID_ROLE_ADMIN || '5624cc82-dc44-41b0-ab5c-68e744db2436',
  ID_ROLE_USER: process.env.ID_ROLE_USER || '7c4a558c-5781-4982-9656-997a813c3771',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseEnvNumber(process.env.DB_PORT, 3306),
  DB_USER: process.env.DB_USER || 'ariel',
  DB_PASSWORD: process.env.DB_PASSWORD || 'ariel',
  DB_NAME: process.env.DB_NAME || 'login_db',
  DB_CONNECTION_LIMIT: parseEnvNumber(process.env.DB_CONNECTION_LIMIT, 10),
  DB_QUEUE_LIMIT: parseEnvNumber(process.env.DB_QUEUE_LIMIT, 0),
  DB_ACQUIRE_TIMEOUT: parseEnvNumber(process.env.DB_ACQUIRE_TIMEOUT, 60000),
  DB_TIMEOUT: parseEnvNumber(process.env.DB_TIMEOUT, 60000),
  DB_RECONNECT_DELAY: parseEnvNumber(process.env.DB_RECONNECT_DELAY, 2000),
  ALLOWED_ORIGINS: parseEnvArray(process.env.ALLOWED_ORIGINS, [
    'http://localhost:8080',
    'http://localhost:1234',
    'http://localhost:5173'
  ])
}

// Database configuration
export const databaseConfig: DatabaseConfig = {
  host: config.DB_HOST,
  user: config.DB_USER,
  port: config.DB_PORT,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  connectionLimit: config.DB_CONNECTION_LIMIT,
  queueLimit: config.DB_QUEUE_LIMIT,
  charset: 'utf8mb4',
  timezone: 'Z',
  dateStrings: false,
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  acquireTimeout: config.DB_ACQUIRE_TIMEOUT,
  timeout: config.DB_TIMEOUT
}

// Re-export individual values for backward compatibility
export const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  PORT,
  NODE_ENV,
  SALT_ROUNDS,
  ID_ROLE_ADMIN,
  ID_ROLE_USER,
  ALLOWED_ORIGINS
} = config
