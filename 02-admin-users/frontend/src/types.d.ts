export interface User {
  id?: string
  name: string
  email: string
  role_id: string
  password: string
}

export interface Role {
  id: string
  name: string
}

export interface LoginData {
  email: string
  password: string
}
