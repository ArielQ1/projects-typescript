import { z } from 'zod'

const bookSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  author: z.string().min(1),
  edition: z.string().optional(),
  availability: z.boolean().optional()
})

export function validateBook (data: unknown) {
  return bookSchema.safeParse(data)
}

export function validatePartialBook (data: unknown) {
  return bookSchema.partial().safeParse(data)
}
