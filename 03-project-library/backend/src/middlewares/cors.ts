import cors from 'cors'

const AllowedOrigins: string[] = process.env.AllowedOrigins
  ? process.env.AllowedOrigins.split(',').map(origin => origin.trim())
  : [
      'http://localhost:8080',
      'http://localhost:1234',
      'http://localhost:5173'
    ]

interface CorsMiddlewareOptions {
  acceptedOrigins?: string[]
}

export const corsMiddleware = ({ acceptedOrigins = AllowedOrigins }: CorsMiddlewareOptions = {}) =>
  cors({
    origin: (origin, callback) => {
      if (!origin || acceptedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('CORS policy violation: Origin not allowed'), false)
    },
    credentials: true
  })
