// src/utils/logger.ts
import { Request, Response, NextFunction } from 'express'
import { NODE_ENV } from '../config/index.js'

interface LogMeta {
  [key: string]: any
}

interface LogData {
  level: string
  message: string
  timestamp: string
  error?: {
    message: string
    stack?: string
    code?: string
  } | null
  [key: string]: any
}

export class Logger {
  static info (message: string, meta: LogMeta = {}): void {
    const timestamp = new Date().toISOString()
    const logData: LogData = {
      level: 'info',
      message,
      timestamp,
      ...meta
    }

    if (NODE_ENV === 'development') {
      console.log(`ℹ️  [${timestamp}] ${message}`, meta)
    } else {
      console.log(JSON.stringify(logData))
    }
  }

  static error (message: string, error: Error | null = null, meta: LogMeta = {}): void {
    const timestamp = new Date().toISOString()
    const logData: LogData = {
      level: 'error',
      message,
      timestamp,
      error: error
        ? {
            message: error.message,
            ...(error.stack !== undefined ? { stack: error.stack } : {}),
            ...((error as any).code !== undefined ? { code: (error as any).code } : {})
          }
        : null,
      ...meta
    }

    if (NODE_ENV === 'development') {
      console.error(`❌ [${timestamp}] ${message}`)
      if (error) {
        console.error('Error details:', error)
      }
      if (Object.keys(meta).length > 0) {
        console.error('Meta:', meta)
      }
    } else {
      console.error(JSON.stringify(logData))
    }
  }

  static warn (message: string, meta: LogMeta = {}): void {
    const timestamp = new Date().toISOString()
    const logData: LogData = {
      level: 'warn',
      message,
      timestamp,
      ...meta
    }

    if (NODE_ENV === 'development') {
      console.warn(`⚠️  [${timestamp}] ${message}`, meta)
    } else {
      console.warn(JSON.stringify(logData))
    }
  }

  static debug (message: string, meta: LogMeta = {}): void {
    if (NODE_ENV === 'development') {
      const timestamp = new Date().toISOString()
      console.debug(`🐛 [${timestamp}] ${message}`, meta)
    }
  }

  static database (operation: string, table: string, meta: LogMeta = {}): void {
    if (NODE_ENV === 'development') {
      const timestamp = new Date().toISOString()
      console.log(`🗄️  [${timestamp}] DB ${operation} on ${table}`, meta)
    }
  }
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now()
  const { method, url, ip } = req

  Logger.info(`Incoming request: ${method} ${url}`, {
    ip,
    userAgent: req.get('User-Agent'),
    requestId: (req as any).id
  })

  res.on('finish', () => {
    const duration = Date.now() - start
    const { statusCode } = res

    const level = statusCode >= 400 ? 'error' : 'info'
    const message = `Request completed: ${method} ${url} - ${statusCode}`

    if (level === 'error') {
      Logger.error(message, null, { ip, statusCode, duration, requestId: (req as any).id })
    } else {
      Logger.info(message, { ip, statusCode, duration, requestId: (req as any).id })
    }
  })

  next()
}
