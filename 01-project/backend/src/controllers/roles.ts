// src/controllers/roles.ts
import { Request, Response } from 'express'
import { validatePartialRole, validateRole } from '../schemas/role.js'
import { Logger } from '../utils/logger.js'

export class RolesController {
  private RoleModel: any

  constructor ({ RoleModel }: { RoleModel: any }) {
    this.RoleModel = RoleModel
  }

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const roles = await this.RoleModel.getAll()
      res.json(roles)
    } catch (error) {
      Logger.error('Controller error in getAll', error as Error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const role = await this.RoleModel.getById({ id })

      if (!role) {
        res.status(404).json({ error: 'Role not found' })
        return
      }

      res.json(role)
    } catch (error) {
      Logger.error('Controller error in getById', error as Error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const received = validateRole(req.body)
      if (!received.success) {
        res.status(400).json({ error: received.error.issues })
        return
      }

      const newRole = await this.RoleModel.create({ input: received.data })
      res.status(201).json(newRole)
    } catch (error) {
      Logger.error('Controller error in create', error as Error)

      // Handle specific model errors
      if ((error as Error).message.includes('Role name already exists')) {
        res.status(400).json({ error: (error as Error).message })
        return
      }

      res.status(500).json({ error: 'Internal server error' })
    }
  }

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const received = validatePartialRole(req.body)
      if (!received.success) {
        res.status(400).json({ error: received.error.issues })
        return
      }

      const { id } = req.params
      const updatedRole = await this.RoleModel.update({ id, input: received.data })
      if (!updatedRole) {
        res.status(404).json({ error: 'Role not found' })
        return
      }

      res.json(updatedRole)
    } catch (error) {
      Logger.error('Controller error in update', error as Error)

      // Handle specific model errors
      if ((error as Error).message.includes('Role name already exists')) {
        res.status(400).json({ error: (error as Error).message })
        return
      }

      res.status(500).json({ error: 'Internal server error' })
    }
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const deleted = await this.RoleModel.delete({ id })

      if (!deleted) {
        res.status(404).json({ error: 'Role not found' })
        return
      }

      res.json({ message: 'Role deleted successfully' })
    } catch (error) {
      Logger.error('Controller error in delete', error as Error)

      // Handle specific model errors
      if ((error as Error).message.includes('Cannot delete role: it is being used by users')) {
        res.status(400).json({ error: (error as Error).message })
        return
      }

      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
