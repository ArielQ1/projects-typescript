import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { validateLogin, validatePartialUser, validateUser } from '../schemas/user'
import { UserModel } from '../models/user'
import { PublicUser } from '../types/UsersTypes'
import { JWT_EXPIRES_IN, JWT_SECRET, NODE_ENV } from '../config'

interface UserControllerParams {
  userModel: typeof UserModel
}

export class UserController {
  private UserModel: typeof UserModel

  constructor ({ userModel }: UserControllerParams) {
    this.UserModel = userModel
  }

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users: PublicUser[] = await this.UserModel.getAll()
      res.json(users)
    } catch (error) {
      console.error('Controller error in getAll:', (error as Error).message)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const user = await this.UserModel.getById({ id })
      if (user) {
        res.json(user)
        return
      }
      res.status(404).json({ message: 'User not found' })
    } catch (error) {
      console.error('Controller error in getById:', (error as Error).message)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  create = async (req: Request, res: Response): Promise<void> => {
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
      const message = (error as Error).message
      console.error('Controller error in create:', message)

      if (message.includes('Email already exists') || message.includes('Invalid role ID')) {
        res.status(400).json({ error: message })
        return
      }

      res.status(500).json({ error: 'Internal server error' })
    }
  }

  update = async (req: Request, res: Response): Promise<void> => {
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
      const message = (error as Error).message
      console.error('Controller error in update:', message)

      if (message.includes('Email already exists') || message.includes('Invalid role ID')) {
        res.status(400).json({ error: message })
        return
      }

      res.status(500).json({ error: 'Internal server error' })
    }
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const result = await this.UserModel.delete({ id })
      if (!result) {
        res.status(404).json({ message: 'User not found' })
        return
      }
      res.json({ message: 'User deleted successfully' })
    } catch (error) {
      console.error('Controller error in delete:', (error as Error).message)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  login = async (req: Request, res: Response): Promise<void> => {
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
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      )

      res.cookie('access_token', token, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
      })
      res.json({ user })
    } catch (error) {
      console.error('Controller error in login:', (error as Error).message)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  logout = (_req: Request, res: Response): void => {
    try {
      res.clearCookie('access_token')
      res.json({ message: 'Logged out successfully' })
    } catch (error) {
      console.error('Controller error in logout:', (error as Error).message)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
