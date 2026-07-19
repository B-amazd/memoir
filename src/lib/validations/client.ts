import { z } from 'zod'

export const clientSchema = z.object({
  displayName: z.string().min(1, 'Name is required').max(100),
  clientType: z.enum(['individual', 'organization']),
  contactPerson: z.string().max(100).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
})

export type ClientFormData = z.infer<typeof clientSchema>