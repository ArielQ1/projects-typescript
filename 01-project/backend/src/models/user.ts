// src/models/user.ts
import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import { RowDataPacket } from 'mysql2/promise'
import { SALT_ROUNDS, ID_ROLE_USER } from '../config/index.js'
import { connection } from '../database/mysqlConnection.js'
import { User, CreateUserInput, UpdateUserInput, ModelMethods } from '../types/index.js'
import { Logger } from '../utils/logger.js'

interface UserRow extends RowDataPacket {
  id: string
  name: string
  email: string
  role_id: string
  password: string
}

type PublicUser = Omit<User, 'password'>

export class UserModel implements ModelMethods<PublicUser, CreateUserInput, UpdateUserInput> {
  static async getAll (): Promise<PublicUser[]> {
    try {
      const [users] = await connection.query<UserRow[]>(
        'SELECT id, name, email, role_id FROM users;'
      )
      return users as PublicUser[]
    } catch (error) {
      Logger.error('Error getting all users', error as Error)
      throw new Error(`Failed to retrieve users: ${(error as Error).message}`)
    }
  }

  static async getById ({ id }: { id: string }): Promise<PublicUser | null> {
    try {
      const [users] = await connection.query<UserRow[]>(
        'SELECT * FROM users WHERE id = ?;',
        [id]
      )

      if (users.length === 0) return null

      const { password: _, ...publicUser } = users[0]
      return publicUser as PublicUser
    } catch (error) {
      Logger.error('Error getting user by id', error as Error)
      throw new Error(`Failed to retrieve user: ${(error as Error).message}`)
    }
  }

  static async getByEmail ({ email }: { email: string }): Promise<PublicUser | null> {
    try {
      const [users] = await connection.query<UserRow[]>(
        'SELECT * FROM users WHERE email = ?;',
        [email]
      )

      if (users.length === 0) return null

      const { password: _, ...publicUser } = users[0]
      return publicUser as PublicUser
    } catch (error) {
      Logger.error('Error getting user by email', error as Error)
      throw new Error(`Failed to retrieve user: ${(error as Error).message}`)
    }
  }

  static async create ({ input }: { input: CreateUserInput }): Promise<PublicUser> {
    try {
      const { id: validatedId, name, email, role_id: roleId, password } = input
      const id = validatedId || crypto.randomUUID()
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

      await connection.query(
        'INSERT INTO users (id, name, email, role_id, password) VALUES (?, ?, ?, ?, ?);',
        [id, name, email, roleId ?? ID_ROLE_USER, hashedPassword]
      )

      const [newUser] = await connection.query<UserRow[]>(
        'SELECT * FROM users WHERE id = ?;',
        [id]
      )

      const { password: _, ...publicUser } = newUser[0]
      return publicUser as PublicUser
    } catch (error) {
      Logger.error('Error creating user', error as Error)

      // Handle specific MySQL errors
      if ((error as any).code === 'ER_DUP_ENTRY') {
        if ((error as Error).message.includes('email')) {
          throw new Error('Email already exists')
        }
        throw new Error('User already exists')
      }

      if ((error as any).code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Invalid role ID')
      }

      throw new Error(`Failed to create user: ${(error as Error).message}`)
    }
  }

  static async update ({ id, input }: { id: string; input: UpdateUserInput }): Promise<PublicUser | null> {
    try {
      const [user] = await connection.query<UserRow[]>(
        'SELECT * FROM users WHERE id = ?;',
        [id]
      )

      if (!user[0]) return null

      const updated = { ...user[0], ...input }

      if (input.password) {
        updated.password = await bcrypt.hash(input.password, SALT_ROUNDS)
      }

      const { name, password, email, role_id: roleId } = updated

      await connection.query(
        'UPDATE users SET name = ?, email = ?, role_id = ?, password = ? WHERE id = ?;',
        [name, email, roleId, password, id]
      )

      const [updatedUser] = await connection.query<UserRow[]>(
        'SELECT * FROM users WHERE id = ?;',
        [id]
      )

      const { password: _, ...publicUser } = updatedUser[0]
      return publicUser as PublicUser
    } catch (error) {
      Logger.error('Error updating user', error as Error)

      // Handle specific MySQL errors
      if ((error as any).code === 'ER_DUP_ENTRY') {
        if ((error as Error).message.includes('email')) {
          throw new Error('Email already exists')
        }
        throw new Error('User already exists')
      }

      if ((error as any).code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Invalid role ID')
      }

      throw new Error(`Failed to update user: ${(error as Error).message}`)
    }
  }

  static async delete ({ id }: { id: string }): Promise<boolean> {
    try {
      const [user] = await connection.query<UserRow[]>(
        'SELECT * FROM users WHERE id = ?;',
        [id]
      )

      if (!user[0]) return false

      await connection.query(
        'DELETE FROM users WHERE id = ?;',
        [id]
      )

      return true
    } catch (error) {
      Logger.error('Error deleting user', error as Error)
      throw new Error(`Failed to delete user: ${(error as Error).message}`)
    }
  }

  static async login ({ email, password }: { email: string; password: string }): Promise<PublicUser | false> {
    try {
      const [users] = await connection.query<UserRow[]>(
        'SELECT * FROM users WHERE email = ?;',
        [email]
      )

      if (users.length === 0) return false

      const user = users[0]

      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) return false

      const { password: _, ...publicUser } = user
      return publicUser as PublicUser
    } catch (error) {
      Logger.error('Error during login', error as Error)
      throw new Error(`Login failed: ${(error as Error).message}`)
    }
  }
}
