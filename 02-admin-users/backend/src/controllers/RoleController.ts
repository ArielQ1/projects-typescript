import { Request, Response } from 'express'
import { RoleModel } from '../models/role'
import { Roles } from '../types/RolesTypes'
import { validatePartialRole, validateRole } from '../schemas/roles'

interface RoleControllerParams {
  roleModel: typeof RoleModel
}

export class RoleController {
  private RoleModel: typeof RoleModel

  constructor ({ roleModel }: RoleControllerParams) {
    this.RoleModel = roleModel
  }

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const roles: Roles[] = await this.RoleModel.getAll()
      res.json(roles)
    } catch (error) {
      console.error('Controller error in getAll:', (error as Error).message)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const role = await this.RoleModel.getById({ id })
      if (role) {
        res.json(role)
        return
      }
      res.status(404).json({ message: 'Role not found' })
    } catch (error) {
      console.error('Controller error in getById:', (error as Error).message)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = validateRole(req.body)
      if (!result.success) {
        res.status(400).json({ error: result.error.issues })
        return
      }

      const newRole = await this.RoleModel.create({ input: result.data })
      res.status(201).json(newRole)
    } catch (error) {
      const message = (error as Error).message
      console.error('Controller error in create:', message)

      if (message.includes('Role already exists')) {
        res.status(400).json({ error: message })
        return
      }

      res.status(500).json({ error: 'Internal server error' })
    }
  }

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = validatePartialRole(req.body)
      if (!result.success) {
        res.status(400).json({ error: result.error.issues })
        return
      }

      const { id } = req.params
      const updatedRole = await this.RoleModel.update({ id, input: result.data })
      if (!updatedRole) {
        res.status(404).json({ message: 'Role not found' })
        return
      }
      res.json(updatedRole)
    } catch (error) {
      const message = (error as Error).message
      console.error('Controller error in update:', message)

      if (message.includes('Role already exists') || message.includes('Invalid role ID')) {
        res.status(400).json({ error: message })
        return
      }

      res.status(500).json({ error: 'Internal server error' })
    }
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const result = await this.RoleModel.delete({ id })
      if (!result) {
        res.status(404).json({ message: 'Role not found' })
        return
      }
      res.json({ message: 'Role deleted successfully' })
    } catch (error) {
      console.error('Controller error in delete:', (error as Error).message)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
