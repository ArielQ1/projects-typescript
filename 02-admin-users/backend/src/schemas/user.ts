import { z } from 'zod'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const userSchema = z.object({
  id: z.string().regex(uuidRegex, 'Invalid UUID').optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().regex(emailRegex, 'Invalid email format'),
  role_id: z.string().regex(uuidRegex, 'Invalid UUID').optional().nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters long')
})

export const loginSchema = z.object({
  email: z.string().regex(emailRegex, 'Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

export type LoginSchema = z.infer<typeof loginSchema>

export function validateLogin (input: unknown) {
  return loginSchema.safeParse(input)
}

export function validateUser (input: unknown) {
  return userSchema.safeParse(input)
}

export function validatePartialUser (input: unknown) {
  return userSchema.partial().safeParse(input)
}
