import mysql, { Pool } from 'mysql2/promise'
import bcrypt from 'bcrypt'
import { UserRow, PublicUser, CreateUserInput, UpdateUserInput } from '../types/UsersTypes'
import { SALT_ROUNDS } from '../config'

const DEFAULT_DB_CONFIG = {
  host: 'localhost',
  user: 'ariel',
  port: 3306,
  password: 'ariel',
  database: 'login_db'
}

type DBConfig = mysql.PoolOptions

const connectionString: mysql.PoolOptions = process.env.DATABASE_URL
  ? { uri: process.env.DATABASE_URL }
  : DEFAULT_DB_CONFIG

const connection: Pool = mysql.createPool(connectionString as DBConfig)

export class UserModel {
  static async getAll (): Promise<PublicUser[]> {
    try {
      const [users] = await connection.query<UserRow[]>(
        'SELECT id, name, email, role_id FROM users;'
      )
      return users
    } catch (error: unknown) {
      console.error('Error getting all users:', (error as Error).message)
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
      const { password, ...publicUser } = users[0]
      return publicUser
    } catch (error: unknown) {
      console.error('Error getting user by ID:', (error as Error).message)
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
      return publicUser
    } catch (error: unknown) {
      console.error('Error getting user by email:', (error as Error).message)
      throw new Error(`Failed to retrieve user: ${(error as Error).message}`)
    }
  }

  static async create ({ input }: { input: CreateUserInput }): Promise<PublicUser> {
    try {
      const { id: validatedId, name, email, role_id: roleId, password } = input
      const id = validatedId ?? crypto.randomUUID()
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

      // Si role_id no se proporciona, usar NULL en la BD
      const finalRoleId = roleId !== undefined ? roleId : null

      await connection.query(
        'INSERT INTO users (id, name, email, role_id, password) VALUES (?, ?, ?, ?, ?);',
        [id, name, email, finalRoleId, hashedPassword]
      )

      const [newUser] = await connection.query<UserRow[]>(
        'SELECT * FROM users WHERE id = ?;',
        [id]
      )

      const { password: _, ...publicUser } = newUser[0]
      return publicUser
    } catch (error: unknown) {
      const mysqlError = error as { code?: string; message: string }

      if (mysqlError.code === 'ER_DUP_ENTRY') {
        if (mysqlError.message.includes('email')) {
          throw new Error('Email already exists')
        }
        throw new Error('User already exists')
      }

      if (mysqlError.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Invalid role ID')
      }

      throw new Error(`Failed to create user: ${mysqlError.message}`)
    }
  }

  static async update ({ id, input }: { id: string; input: UpdateUserInput }): Promise<PublicUser | false> {
    try {
      const [user] = await connection.query<UserRow[]>(
        'SELECT * FROM users WHERE id = ?;',
        [id]
      )

      if (!user[0]) return false

      const updated = { ...user[0], ...input }

      if (input.password) {
        updated.password = await bcrypt.hash(input.password, SALT_ROUNDS ?? 10)
      }

      // Construir query dinámicamente solo con los campos proporcionados
      const fieldsToUpdate: string[] = []
      const values: (string | null)[] = []

      if (input.name !== undefined) {
        fieldsToUpdate.push('name = ?')
        values.push(input.name)
      }
      if (input.email !== undefined) {
        fieldsToUpdate.push('email = ?')
        values.push(input.email)
      }
      if (input.role_id !== undefined) {
        fieldsToUpdate.push('role_id = ?')
        values.push(input.role_id)
      }
      if (input.password !== undefined) {
        fieldsToUpdate.push('password = ?')
        values.push(updated.password)
      }

      if (fieldsToUpdate.length === 0) {
        // No hay campos para actualizar, retornar el usuario actual
        const { password: _, ...publicUser } = user[0]
        return publicUser
      }

      values.push(id) // Agregar id al final para WHERE clause

      await connection.query(
        `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?;`,
        values
      )

      const [updatedUser] = await connection.query<UserRow[]>(
        'SELECT * FROM users WHERE id = ?;',
        [id]
      )

      const { password: _, ...publicUser } = updatedUser[0]
      return publicUser
    } catch (error: unknown) {
      const mysqlError = error as { code?: string; message: string }

      if (mysqlError.code === 'ER_DUP_ENTRY') {
        if (mysqlError.message.includes('email')) {
          throw new Error('Email already exists')
        }
        throw new Error('User already exists')
      }

      if (mysqlError.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Invalid role ID')
      }

      throw new Error(`Failed to update user: ${mysqlError.message}`)
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
    } catch (error: unknown) {
      console.error('Error deleting user:', (error as Error).message)
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

      const isPasswordValid = await bcrypt.compare(password, user.password!)
      if (!isPasswordValid) return false

      const { password: _, ...publicUser } = user
      return publicUser
    } catch (error: unknown) {
      console.error('Error during login:', (error as Error).message)
      throw new Error(`Login failed: ${(error as Error).message}`)
    }
  }
}
