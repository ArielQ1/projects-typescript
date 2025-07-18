import { z } from 'zod'
import { CreateUserInput, LoginInput, UpdateUserInput } from '../types/index.js'

const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  role_id: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export function validateLogin (received: unknown): { success: true; data: LoginInput } | { success: false; error: z.ZodError } {
  const result = loginSchema.safeParse(received)
  return result
}

export function validateUser (received: unknown): { success: true; data: CreateUserInput } | { success: false; error: z.ZodError } {
  const result = userSchema.safeParse(received)
  return result
}

export function validatePartialUser (
  received: unknown
): { success: true; data: Partial<UpdateUserInput> } | { success: false; error: z.ZodError } {
  const result = userSchema.partial().safeParse(received)
  if (result.success) {
    return { success: true, data: result.data as Partial<UpdateUserInput> }
  } else {
    return { success: false, error: result.error }
  }
}

export { userSchema, loginSchema }
