// src/database/mysqlConnection.ts
import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import { databaseConfig } from '../config/index.js'
import { Logger } from '../utils/logger.js'
import { HealthCheck, PoolStats, DatabaseServerStats } from '../types/index.js'

// Create connection pool with error handling
export const pool: Pool = mysql.createPool(databaseConfig)

// Define query result types
type QueryResult<T = RowDataPacket[]> = [T, mysql.FieldPacket[]]

// Connection wrapper with error handling and retry logic
export const connection = {
  async query<T extends RowDataPacket[]>(sql: string, params?: any[]): Promise<[T]> {
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        const [results] = await pool.execute<T>(sql, params) as QueryResult<T>
        return [results]
      } catch (error) {
        attempt++
        Logger.error(`Database query attempt ${attempt} failed`, error as Error, { sql, params })

        // Check if it's a connection error
        if (this.isConnectionError(error as Error) && attempt < maxRetries) {
          const delay = parseInt(process.env.DB_RECONNECT_DELAY || '2000', 10)
          Logger.warn(`Retrying database connection in ${delay}ms...`, { attempt, maxRetries })
          await this.delay(delay)
          continue
        }

        // If all retries failed or it's not a connection error, throw
        Logger.error('Database query failed after all retries', error as Error, { sql, params, attempts: attempt })
        throw error
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new Error('Query failed after all retries')
  },

  async execute<T extends RowDataPacket[]>(sql: string, params?: any[]): Promise<[T]> {
    return this.query<T>(sql, params)
  },

  isConnectionError (error: Error): boolean {
    const connectionErrors = [
      'ECONNRESET',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'PROTOCOL_CONNECTION_LOST',
      'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR'
    ]
    return connectionErrors.some(errCode =>
      (error as any).code === errCode || error.message.includes(errCode)
    )
  },

  delay (ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  async getConnection (): Promise<PoolConnection> {
    return pool.getConnection()
  },

  async end (): Promise<void> {
    return pool.end()
  },

  // Health check method
  async healthCheck (): Promise<HealthCheck> {
    try {
      await this.query('SELECT 1 as health')
      return { status: 'healthy', timestamp: new Date().toISOString() }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }
    }
  }
}

// Pool event listeners for monitoring
pool.on('connection', (connection: PoolConnection) => {
  Logger.info('New database connection established', { connectionId: connection.threadId })
})

pool.on('error', (err: Error) => {
  Logger.error('Database pool error', err)
  if ((err as any).code === 'PROTOCOL_CONNECTION_LOST') {
    Logger.warn('Database connection lost, pool will handle reconnection')
  }
})

pool.on('acquire', (connection: PoolConnection) => {
  Logger.debug('Connection acquired', { connectionId: connection.threadId })
})

pool.on('release', (connection: PoolConnection) => {
  Logger.debug('Connection released', { connectionId: connection.threadId })
})

// Graceful shutdown
process.on('SIGINT', async () => {
  Logger.info('Received SIGINT, closing database pool...')
  try {
    await pool.end()
    Logger.info('Database pool closed successfully')
    process.exit(0)
  } catch (error) {
    Logger.error('Error closing database pool', error as Error)
    process.exit(1)
  }
})

process.on('SIGTERM', async () => {
  Logger.info('Received SIGTERM, closing database pool...')
  try {
    await pool.end()
    Logger.info('Database pool closed successfully')
    process.exit(0)
  } catch (error) {
    Logger.error('Error closing database pool', error as Error)
    process.exit(1)
  }
})

// Test connection on startup
try {
  const healthCheck = await connection.healthCheck()
  if (healthCheck.status === 'healthy') {
    Logger.info('Database connection pool initialized successfully')
  } else {
    Logger.error('Database health check failed', null, { healthCheck })
  }
} catch (error) {
  Logger.error('Failed to initialize database connection', error as Error)
}
