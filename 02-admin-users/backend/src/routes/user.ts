import { Router } from 'express'
import { UserModel } from '../models/user'
import { UserController } from '../controllers/UserController'

interface CreateUsersRouterOptions {
  userModel: typeof UserModel
}

export const createUsersRouter = ({ userModel }: CreateUsersRouterOptions): Router => {
  const usersRouter = Router()
  const userController = new UserController({ userModel })

  usersRouter.get('/', userController.getAll)
  usersRouter.get('/:id', userController.getById)
  usersRouter.put('/:id', userController.update)
  usersRouter.delete('/:id', userController.delete)
  usersRouter.post('/register', userController.create)
  usersRouter.post('/login', userController.login)
  usersRouter.post('/logout', userController.logout)

  return usersRouter
}
