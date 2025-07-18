import { RowDataPacket } from 'mysql2'

export interface Roles {
  id: string
  name: string
}

export interface RoleRow extends Roles, RowDataPacket {}

export interface CreateRoleInput {
  id?: string
  name: string
}

export interface UpdateRoleInput {
  name?: string
}
