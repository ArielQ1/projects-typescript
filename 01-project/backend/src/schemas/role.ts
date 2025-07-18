import { z } from 'zod'
import { CreateRoleInput, UpdateRoleInput } from '../types/index.js'

const roleSchema = z.object({
  id: z.string().uuid('Invalid UUID format').optional(),
  name: z.string().min(1, 'Role name is required').max(50, 'Role name must be less than 50 characters')
})

export function validateRole (received: unknown): { success: true; data: CreateRoleInput } | { success: false; error: z.ZodError } {
  const result = roleSchema.safeParse(received)
  if (result.success) {
    const { name, id } = result.data
    return { success: true, data: { name, id: id ?? '' } }
  } else {
    return { success: false, error: result.error }
  }
}

export function validatePartialRole (received: unknown): { success: true; data: UpdateRoleInput } | { success: false; error: z.ZodError } {
  const result = roleSchema.partial().safeParse(received)
  if (result.success) {
    return { success: true, data: result.data as UpdateRoleInput }
  } else {
    return { success: false, error: result.error }
  }
}

export { roleSchema }
