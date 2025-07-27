import cors from 'cors'

const AllowedOrigins: string[] = process.env.AllowedOrigins
  ? process.env.AllowedOrigins.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',  // Swagger UI
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
      // Permitir peticiones sin origin (como Swagger UI) o de orígenes permitidos
      if (!origin || acceptedOrigins.includes(origin)) {
        return callback(null, true)
      }

      console.log(`CORS: Origin ${origin} not allowed. Allowed origins:`, acceptedOrigins)
      return callback(new Error('CORS policy violation: Origin not allowed'), false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
