// src/routes/roles.ts
import { Router } from 'express'
import { RolesController } from '../controllers/roles.js'
import { requireAuth, requireRole } from '../middlewares/auth.js'
import { ID_ROLE_ADMIN } from '../config/index.js'
import { RoleModel } from '../models/role.js'

interface CreateRolesRouterParams {
  roleModel: typeof RoleModel
}

export const createRolesRouter = ({ roleModel }: CreateRolesRouterParams): Router => {
  const rolesRouter = Router()
  const rolesController = new RolesController({ RoleModel: roleModel })

  rolesRouter.get('/', requireAuth, rolesController.getAll)
  rolesRouter.get('/:id', requireAuth, requireRole([ID_ROLE_ADMIN]), rolesController.getById)
  rolesRouter.post('/', requireAuth, requireRole([ID_ROLE_ADMIN]), rolesController.create)
  rolesRouter.put('/:id', requireAuth, requireRole([ID_ROLE_ADMIN]), rolesController.update)
  rolesRouter.delete('/:id', requireAuth, requireRole([ID_ROLE_ADMIN]), rolesController.delete)

  return rolesRouter
}
