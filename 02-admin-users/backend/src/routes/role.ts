import { Router } from 'express'
import { RoleModel } from '../models/role'
import { RoleController } from '../controllers/RoleController'

interface CreateRolesRouterOptions {
  roleModel: typeof RoleModel
}

export const createRolesRouter = ({ roleModel }: CreateRolesRouterOptions): Router => {
  const rolesRouter = Router()
  const roleController = new RoleController({ roleModel })

  rolesRouter.get('/', roleController.getAll)
  rolesRouter.get('/:id', roleController.getById)
  rolesRouter.post('/', roleController.create)
  rolesRouter.put('/:id', roleController.update)
  rolesRouter.delete('/:id', roleController.delete)

  return rolesRouter
}
