// src/routes/users.ts
import { Router } from 'express'
import { UserController } from '../controllers/users.js'
import { requireAuth, requireRole } from '../middlewares/auth.js'
import { ID_ROLE_ADMIN } from '../config/index.js'
import { authLimiter, createUserLimiter } from '../middlewares/rateLimiting.js'
import { UserModel } from '../models/user.js'

interface CreateUsersRouterParams {
  userModel: typeof UserModel
}

export const createUsersRouter = ({ userModel }: CreateUsersRouterParams): Router => {
  const usersRouter = Router()
  const userController = new UserController({ UserModel: userModel })

  usersRouter.get('/', requireAuth, userController.getAll)
  usersRouter.get('/:id', requireAuth, userController.getById)
  usersRouter.put('/:id', requireRole([ID_ROLE_ADMIN]), userController.update)
  usersRouter.delete('/:id', requireRole([ID_ROLE_ADMIN]), userController.delete)
  usersRouter.post('/register', createUserLimiter, userController.create)
  usersRouter.post('/login', authLimiter, userController.login)
  usersRouter.post('/logout', userController.logout)

  return usersRouter
}
