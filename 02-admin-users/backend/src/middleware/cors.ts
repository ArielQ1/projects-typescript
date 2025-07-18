import cors from 'cors'
import { ALLOWED_ORIGINS } from '../config'

interface CorsMiddlewareOptions {
  acceptedOrigins?: string[]
}

export const corsMiddleware = ({ acceptedOrigins = ALLOWED_ORIGINS }: CorsMiddlewareOptions = {}) =>
  cors({
    origin: (origin, callback) => {
      if (!origin || acceptedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true
  })
