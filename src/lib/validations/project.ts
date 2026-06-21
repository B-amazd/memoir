import { z } from 'zod'

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().max(1000).optional().or(z.literal('')),
  categoryId: z.string().optional().or(z.literal('')),
  isPublished: z.boolean(),
})

export type ProjectFormData = z.infer<typeof projectSchema>

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
})

export type CategoryFormData = z.infer<typeof categorySchema>