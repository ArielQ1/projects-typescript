import express, { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { JWT_SECRET } from './config'
import { createUsersRouter } from './routes/user'
import { UserModel } from './models/user'
import { RoleModel } from './models/role'
import { createRolesRouter } from './routes/role'
import { corsMiddleware } from './middleware/cors'

interface SessionUser {
  id: string
  email: string
  role_id: string | null
}

declare global {
  namespace Express {
    interface Request {
      session?: { user: SessionUser | null }
    }
  }
}

interface CreateAppOptions {
  userModel: typeof UserModel
  roleModel: typeof RoleModel
}

export const createApp = ({ userModel, roleModel }: CreateAppOptions): void => {
  const app = express()

  // Middleware
  app.use(corsMiddleware())
  app.use(express.json())
  app.use(cookieParser())
  app.disable('x-powered-by')

  app.use((req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies.access_token
    req.session = { user: null }

    if (token) {
      try {
        const data = jwt.verify(token, JWT_SECRET) as SessionUser
        req.session.user = data
      } catch (_err) {
        // Token inválido, omitimos la sesión
      }
    }
    next()
  })

  app.use('/api/users', createUsersRouter({ userModel }))
  app.use('/api/roles', createRolesRouter({ roleModel }))

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`)
  })
}
