import { z } from 'zod'

export const clientPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  eventDate: z.string().optional().or(z.literal('')),
  message: z.string().max(1000).optional().or(z.literal('')),
  isPublished: z.boolean(),
})

export type ClientPageFormData = z.infer<typeof clientPageSchema>