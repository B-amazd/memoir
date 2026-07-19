import { z } from 'zod'

export const serviceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
})

export type ServiceFormData = z.infer<typeof serviceSchema>