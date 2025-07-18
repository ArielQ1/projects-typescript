// src/models/role.ts
import crypto from 'node:crypto'
import { RowDataPacket } from 'mysql2/promise'
import { connection } from '../database/mysqlConnection.js'
import { Role, CreateRoleInput, UpdateRoleInput, ModelMethods } from '../types/index.js'
import { Logger } from '../utils/logger.js'

interface RoleRow extends RowDataPacket {
  id: string
  name: string
}

export class RoleModel implements ModelMethods<Role, CreateRoleInput, UpdateRoleInput> {
  static async getAll (): Promise<Role[]> {
    try {
      const [roles] = await connection.query<RoleRow[]>(
        'SELECT * FROM roles;'
      )
      return roles as Role[]
    } catch (error) {
      Logger.error('Error getting all roles', error as Error)
      throw new Error(`Failed to retrieve roles: ${(error as Error).message}`)
    }
  }

  static async getById ({ id }: { id: string }): Promise<Role | null> {
    try {
      const [roles] = await connection.query<RoleRow[]>(
        'SELECT * FROM roles WHERE id = ?;',
        [id]
      )

      if (roles.length === 0) return null

      return roles[0] as Role
    } catch (error) {
      Logger.error('Error getting role by id', error as Error)
      throw new Error(`Failed to retrieve role: ${(error as Error).message}`)
    }
  }

  static async create ({ input }: { input: CreateRoleInput }): Promise<Role> {
    try {
      const { id: validatedId, name } = input
      const id = validatedId || crypto.randomUUID()

      await connection.query(
        'INSERT INTO roles (id, name) VALUES (?, ?);',
        [id, name]
      )

      const [newRole] = await connection.query<RoleRow[]>(
        'SELECT * FROM roles WHERE id = ?;',
        [id]
      )

      return newRole[0] as Role
    } catch (error) {
      Logger.error('Error creating role', error as Error)

      // Handle specific MySQL errors
      if ((error as any).code === 'ER_DUP_ENTRY') {
        throw new Error('Role name already exists')
      }

      throw new Error(`Failed to create role: ${(error as Error).message}`)
    }
  }

  static async update ({ id, input }: { id: string; input: UpdateRoleInput }): Promise<Role | null> {
    try {
      const { name } = input

      // First check if role exists
      const existingRole = await this.getById({ id })
      if (!existingRole) return null

      await connection.query(
        'UPDATE roles SET name = ? WHERE id = ?;',
        [name, id]
      )

      const [updatedRole] = await connection.query<RoleRow[]>(
        'SELECT * FROM roles WHERE id = ?;',
        [id]
      )

      return updatedRole[0] as Role
    } catch (error) {
      Logger.error('Error updating role', error as Error)

      // Handle specific MySQL errors
      if ((error as any).code === 'ER_DUP_ENTRY') {
        throw new Error('Role name already exists')
      }

      throw new Error(`Failed to update role: ${(error as Error).message}`)
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
    } catch (error) {
      Logger.error('Error deleting role', error as Error)

      // Handle foreign key constraint errors
      if ((error as any).code === 'ER_ROW_IS_REFERENCED_2') {
        throw new Error('Cannot delete role: it is being used by users')
      }

      throw new Error(`Failed to delete role: ${(error as Error).message}`)
    }
  }
}
