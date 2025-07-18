// src/middlewares/rateLimiting.ts
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit'
import { Request, Response } from 'express'
import { NODE_ENV } from '../config/index.js'
import { Logger } from '../utils/logger.js'

// General rate limiter
export const generalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    Logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    })
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    })
  }
})

// Stricter rate limiter for authentication endpoints
export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: NODE_ENV === 'production' ? 5 : 50, // Limit each IP to 5 auth attempts per windowMs in production
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    Logger.warn('Authentication rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      body: req.body ? { email: req.body.email } : undefined
    })
    res.status(429).json({
      error: 'Too many authentication attempts from this IP, please try again later.',
      retryAfter: '15 minutes'
    })
  }
})

// Rate limiter for user creation (registration)
export const createUserLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: NODE_ENV === 'production' ? 3 : 30, // Limit each IP to 3 user creations per hour in production
  message: {
    error: 'Too many account creation attempts from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    Logger.warn('User creation rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      body: req.body ? { email: req.body.email } : undefined
    })
    res.status(429).json({
      error: 'Too many account creation attempts from this IP, please try again later.',
      retryAfter: '1 hour'
    })
  }
})
