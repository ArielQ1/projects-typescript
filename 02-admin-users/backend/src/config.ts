export const JWT_SECRET: string = process.env.JWT_SECRET || 'defaultsecret'
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '1h'
export const NODE_ENV: string = process.env.NODE_ENV || 'development'
export const SALT_ROUNDS = 10
export const ALLOWED_ORIGINS: string[] = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:8080',
      'http://localhost:1234',
      'http://localhost:5173'
    ]
