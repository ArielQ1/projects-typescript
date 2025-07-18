// src/middlewares/auth.ts
import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/index.js'
import { AuthenticatedRequest } from '../types/index.js'
import { Logger } from '../utils/logger.js'

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies.access_token

    if (!token) {
      res.status(401).json({ error: 'Access token required' })
      return
    }

    const decoded = jwt.verify(token, JWT_SECRET as string) as { id: string; email: string; role_id: string }
    req.user = decoded
    next()
  } catch (error) {
    Logger.error('Auth middleware error', error as Error)
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' })
        return
      }

      if (!allowedRoles.includes(req.user.role_id)) {
        res.status(403).json({ error: 'Insufficient permissions' })
        return
      }

      next()
    } catch (error) {
      Logger.error('Role middleware error', error as Error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
