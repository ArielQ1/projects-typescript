// src/app.ts
import express from 'express'
import cookieParser from 'cookie-parser'
import { corsMiddleware } from './middlewares/cors.js'
import { securityHeaders, jsonSecurity } from './middlewares/security.js'
import { createUsersRouter } from './routes/users.js'
import { createRolesRouter } from './routes/roles.js'
import { PORT, NODE_ENV } from './config/index.js'
import { Logger } from './utils/logger.js'

interface CreateAppParams {
  userModel: any
  roleModel: any
}

export const createApp = ({ userModel, roleModel }: CreateAppParams): express.Application => {
  const app = express()

  // Security middleware
  app.use(securityHeaders)
  app.use(jsonSecurity)
  
  // CORS middleware
  app.use(corsMiddleware())
  
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  
  // Cookie parser
  app.use(cookieParser())

  // Routes
  app.use('/api/users', createUsersRouter({ userModel }))
  app.use('/api/roles', createRolesRouter({ roleModel }))

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // 404 handler
  app.use('*', (_req, res) => {
    res.status(404).json({ error: 'Route not found' })
  })

  // Error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    Logger.error('Unhandled error', err)
    res.status(500).json({ error: 'Internal server error' })
  })

  // Start server
  const server = app.listen(PORT, () => {
    Logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`)
  })

  // Graceful shutdown
  process.on('SIGTERM', () => {
    Logger.info('SIGTERM received, shutting down gracefully')
    server.close(() => {
      Logger.info('Process terminated')
    })
  })

  return app
}
