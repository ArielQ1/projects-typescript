import { Request } from 'express'

export interface User {
  id: string
  name: string
  email: string
  role_id: string
  password?: string
}

export interface CreateUserInput {
  id?: string
  name: string
  email: string
  role_id?: string
  password: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role_id?: string
  password?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface Role {
  id: string
  name: string
}

export interface CreateRoleInput {
  id?: string
  name: string
}

export interface UpdateRoleInput {
  name?: string
}

export interface DatabaseConfig {
  host: string
  user: string
  port: number
  password: string
  database: string
  connectionLimit?: number
  queueLimit?: number
  charset: string
  timezone: string
  dateStrings: boolean
  ssl: boolean | { rejectUnauthorized: boolean }
  acquireTimeout?: number
  timeout?: number
}

export interface PoolStats {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  queuedRequests: number
}

export interface DatabaseServerStats {
  Threads_connected: number
  Threads_running: number
  Max_used_connections: number
  Aborted_connects: number
  Connection_errors_max_connections: number
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  error?: string
}

export interface SystemStatus {
  database: HealthCheck
  pool: PoolStats | null
  server: DatabaseServerStats | null
  timestamp: string
}

// JWT Types
export interface JWTPayload {
  id: string
  email: string
  role_id: string
  iat?: number
  exp?: number
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload
  cookies: { [key: string]: string }
}

// Model Method Types
export interface ModelMethods<T, CreateInput, UpdateInput> {
  getAll(): Promise<T[]>
  getById(params: { id: string }): Promise<T | null>
  create(params: { input: CreateInput }): Promise<T>
  update(params: { id: string; input: UpdateInput }): Promise<T | null>
  delete(params: { id: string }): Promise<boolean>
}

// Environment Variables
export interface EnvConfig {
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  PORT: number
  NODE_ENV: string
  SALT_ROUNDS: number
  ID_ROLE_ADMIN: string
  ID_ROLE_USER: string
  DB_HOST: string
  DB_PORT: number
  DB_USER: string
  DB_PASSWORD: string
  DB_NAME: string
  DB_CONNECTION_LIMIT: number
  DB_QUEUE_LIMIT: number
  DB_ACQUIRE_TIMEOUT: number
  DB_TIMEOUT: number
  DB_RECONNECT_DELAY: number
  ALLOWED_ORIGINS: string[]
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
