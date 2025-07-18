// src/controllers/users.ts
import { Response } from 'express'
import jwt from 'jsonwebtoken'
import { validateLogin, validatePartialUser, validateUser } from '../schemas/user.js'
import { JWT_SECRET, NODE_ENV } from '../config/index.js'
import { AuthenticatedRequest } from '../types/index.js'
import { Logger } from '../utils/logger.js'

export class UserController {
  private UserModel: any

  constructor ({ UserModel }: { UserModel: any }) {
    this.UserModel = UserModel
  }

  getAll = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const users = await this.UserModel.getAll()
      res.json(users)
    } catch (error) {
      Logger.error('Controller error in getAll', error as Error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  getById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const user = await this.UserModel.getById({ id })
      if (user) {
        res.json(user)
        return
      }
      res.status(404).json({ message: 'User not found' })
    } catch (error) {
      Logger.error('Controller error in getById', error as Error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = validateUser(req.body)
      if (!result.success) {
        res.status(400).json({ error: result.error.issues })
        return
      }

      const existingUser = await this.UserModel.getByEmail({ email: result.data.email })
      if (existingUser) {
        res.status(400).json({ error: 'Email already exists' })
        return
      }

      const newUser = await this.UserModel.create({ input: result.data })
      res.status(201).json(newUser)
    } catch (error) {
      Logger.error('Controller error in create', error as Error)

      // Handle specific model errors
      if ((error as Error).message.includes('Email already exists')) {
        res.status(400).json({ error: (error as Error).message })
        return
      }
      if ((error as Error).message.includes('Invalid role ID')) {
        res.status(400).json({ error: (error as Error).message })
        return
      }

      res.status(500).json({ error: 'Internal server error' })
    }
  }

  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = validatePartialUser(req.body)
      if (!result.success) {
        res.status(400).json({ error: result.error.issues })
        return
      }

      const { id } = req.params
      const updatedUser = await this.UserModel.update({ id, input: result.data })
      if (!updatedUser) {
        res.status(404).json({ message: 'User not found' })
        return
      }

      res.json(updatedUser)
    } catch (error) {
      Logger.error('Controller error in update', error as Error)

      // Handle specific model errors
      if ((error as Error).message.includes('Email already exists')) {
        res.status(400).json({ error: (error as Error).message })
        return
      }
      if ((error as Error).message.includes('Invalid role ID')) {
        res.status(400).json({ error: (error as Error).message })
        return
      }

      res.status(500).json({ error: 'Internal server error' })
    }
  }

  delete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const result = await this.UserModel.delete({ id })
      if (result === false) {
        res.status(404).json({ message: 'User not found' })
        return
      }
      res.json({ message: 'User deleted successfully' })
    } catch (error) {
      Logger.error('Controller error in delete', error as Error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = validateLogin(req.body)
      if (!result.success) {
        res.status(400).json({ error: result.error.issues })
        return
      }

      const { email, password } = result.data

      const user = await this.UserModel.login({ email, password })
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' })
        return
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role_id: user.role_id },
        JWT_SECRET as string,
        { expiresIn: '1h' }
      )

      res.cookie('access_token', token, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
      }).json({ user })
    } catch (error) {
      Logger.error('Controller error in login', error as Error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  logout = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      res.clearCookie('access_token')
      res.json({ message: 'Logged out successfully' })
    } catch (error) {
      Logger.error('Controller error in logout', error as Error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
