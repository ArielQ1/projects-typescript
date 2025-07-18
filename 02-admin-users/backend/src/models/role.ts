import mysql, { Pool } from 'mysql2/promise'
import { CreateRoleInput, RoleRow, Roles, UpdateRoleInput } from '../types/RolesTypes'

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

export class RoleModel {
  static async getAll (): Promise<Roles[]> {
    try {
      const [roles] = await connection.query<RoleRow[]>(
        'SELECT id, name FROM roles;'
      )
      return roles
    } catch (error: unknown) {
      console.error('Error getting all roles:', (error as Error).message)
      throw new Error(`Failed to retrieve roles: ${(error as Error).message}`)
    }
  }

  static async getById ({ id }: { id: string }): Promise<Roles | null> {
    try {
      const [role] = await connection.query<RoleRow[]>(
        'SELECT * FROM roles WHERE id = ?;',
        [id]
      )
      if (role.length === 0) return null
      return role[0]
    } catch (error: unknown) {
      console.error('Error getting role by ID:', (error as Error).message)
      throw new Error(`Failed to retrieve role: ${(error as Error).message}`)
    }
  }

  static async create ({ input }: { input: CreateRoleInput }): Promise<Roles> {
    try {
      const { id: validatedId, name } = input
      const id = validatedId ?? crypto.randomUUID()

      await connection.query(
        'INSERT INTO roles (id, name) VALUES (?, ?);',
        [id, name]
      )

      const [newRole] = await connection.query<RoleRow[]>(
        'SELECT * FROM roles WHERE id = ?;',
        [id]
      )

      return newRole[0]
    } catch (error: unknown) {
      const mysqlError = error as { code?: string; message: string }

      if (mysqlError.code === 'ER_DUP_ENTRY') {
        throw new Error('Role already exists')
      }

      throw new Error(`Failed to create role: ${mysqlError.message}`)
    }
  }

  static async update ({ id, input }: { id: string; input: UpdateRoleInput }): Promise<Roles | false> {
    try {
      const [role] = await connection.query<RoleRow[]>(
        'SELECT * FROM roles WHERE id = ?;',
        [id]
      )

      if (!role[0]) return false

      const updated = { ...role[0], ...input }

      await connection.query(
        'UPDATE roles SET name = ? WHERE id = ?;',
        [updated.name, id]
      )
      return updated
    } catch (error: unknown) {
      const mysqlError = error as { code?: string; message: string }

      if (mysqlError.code === 'ER_DUP_ENTRY') {
        throw new Error('Role already exists')
      }

      throw new Error(`Failed to update role: ${mysqlError.message}`)
    }
  }

  static async delete ({ id }: { id: string }): Promise<boolean> {
    try {
      const [role] = await connection.query<RoleRow[]>(
        'SELECT * FROM roles WHERE id = ?;',
        [id]
      )

      if (!role[0]) return false

      await connection.query(
        'DELETE FROM roles WHERE id = ?;',
        [id]
      )
      return true
    } catch (error: unknown) {
      console.error('Error deleting role:', (error as Error).message)
      throw new Error(`Failed to delete role: ${(error as Error).message}`)
    }
  }
}
