// src/utils/databaseMonitor.ts
import { RowDataPacket } from 'mysql2/promise'
import { connection, pool } from '../database/mysqlConnection.js'
import { Logger } from './logger.js'
import { PoolStats, DatabaseServerStats, SystemStatus } from '../types/index.js'

interface ServerStatusRow extends RowDataPacket {
  Variable_name: string
  Value: string
}

export class DatabaseMonitor {
  static async getPoolStats (): Promise<PoolStats | null> {
    try {
      // TypeScript needs proper typing for pool internals
      const poolInternal = pool as any
      return {
        totalConnections: poolInternal.config.connectionLimit || 0,
        activeConnections: poolInternal._allConnections?.length || 0,
        idleConnections: poolInternal._freeConnections?.length || 0,
        queuedRequests: poolInternal._connectionQueue?.length || 0
      }
    } catch (error) {
      Logger.error('Error getting pool stats', error as Error)
      return null
    }
  }

  static async getServerStats (): Promise<DatabaseServerStats | null> {
    try {
      const [results] = await connection.query<ServerStatusRow[]>(
        'SHOW STATUS WHERE Variable_name IN (?, ?, ?, ?, ?)',
        [
          'Threads_connected',
          'Threads_running',
          'Max_used_connections',
          'Aborted_connects',
          'Connection_errors_max_connections'
        ]
      )

      const stats: Partial<DatabaseServerStats> = {}
      results.forEach(row => {
        const key = row.Variable_name as keyof DatabaseServerStats
        stats[key] = parseInt(row.Value, 10)
      })

      return stats as DatabaseServerStats
    } catch (error) {
      Logger.error('Error getting server stats', error as Error)
      return null
    }
  }

  static async getSystemStatus (): Promise<SystemStatus> {
    try {
      const healthCheck = await connection.healthCheck()
      const poolStats = await this.getPoolStats()
      const serverStats = await this.getServerStats()

      return {
        database: healthCheck,
        pool: poolStats,
        server: serverStats,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      Logger.error('Error getting system status', error as Error)
      return {
        database: { status: 'unhealthy', error: (error as Error).message, timestamp: new Date().toISOString() },
        pool: null,
        server: null,
        timestamp: new Date().toISOString()
      }
    }
  }

  static startMonitoring (intervalMs: number = 30000): void {
    Logger.info('Starting database monitoring', { interval: intervalMs })

    setInterval(async () => {
      const status = await this.getSystemStatus()

      if (status.database.status === 'healthy') {
        Logger.debug('Database monitoring check', status)
      } else {
        Logger.warn('Database health check failed', status)
      }

      // Alert if too many connections
      if (status.pool && status.pool.activeConnections > status.pool.totalConnections * 0.8) {
        Logger.warn('High database connection usage', {
          activeConnections: status.pool.activeConnections,
          totalConnections: status.pool.totalConnections,
          utilizationPercent: Math.round((status.pool.activeConnections / status.pool.totalConnections) * 100)
        })
      }
    }, intervalMs)
  }
}
