// src/middlewares/security.ts
import { Request, Response, NextFunction } from 'express'
import { NODE_ENV } from '../config/index.js'

// Security headers middleware
export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Content Security Policy
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  )

  // HSTS in production
  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // Permissions policy
  res.setHeader('Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=()'
  )

  next()
}

// Additional JSON security middleware
export const jsonSecurity = (req: Request, res: Response, next: NextFunction): void => {
  // Limit JSON payload size
  if (req.is('application/json')) {
    const contentLength = parseInt(req.get('content-length') || '0', 10)
    if (contentLength > 1024 * 1024) { // 1MB limit
      res.status(413).json({ error: 'Payload too large' })
      return
    }
  }
  next()
}
