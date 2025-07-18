// src/middlewares/cors.ts
import cors, { CorsOptions } from 'cors'
import { ALLOWED_ORIGINS } from '../config/index.js'

interface CorsMiddlewareOptions {
  acceptedOrigins?: string[]
}

export const corsMiddleware = ({ acceptedOrigins = ALLOWED_ORIGINS }: CorsMiddlewareOptions = {}) => {
  const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (acceptedOrigins.includes(origin || '')) {
        return callback(null, true)
      }

      if (!origin) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true
  }

  return cors(corsOptions)
}
