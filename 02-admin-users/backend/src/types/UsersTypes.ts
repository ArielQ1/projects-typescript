import { RowDataPacket } from 'mysql2/promise'

export interface User {
  id: string
  name: string
  email: string
  role_id: string | null
  password: string
}

export interface UserRow extends User, RowDataPacket {}

export type PublicUser = Omit<User, 'password'>

export interface CreateUserInput {
  id?: string
  name: string
  email: string
  password: string
  role_id?: string | null
}

export interface UpdateUserInput {
  name?: string
  email?: string
  password?: string
  role_id?: string | null
}
