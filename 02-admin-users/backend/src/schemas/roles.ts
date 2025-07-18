import { z } from 'zod'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const nameRegex = /^[a-zA-Z0-9 ]{1,50}$/

export const roleSchema = z.object({
  id: z.string().regex(uuidRegex, 'Invalid UUID').optional(),
  name: z.string().regex(nameRegex, 'Invalid role name').min(1, 'Role name is required')
})

export function validateRole (input: unknown) {
  return roleSchema.safeParse(input)
}

export function validatePartialRole (input: unknown) {
  return roleSchema.partial().safeParse(input)
}
