import { z } from 'zod'

export const portfolioSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional().or(z.literal('')),
  heroTitle: z.string().max(100).optional().or(z.literal('')),
  heroSubtitle: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  instagram: z.string().max(100).optional().or(z.literal('')),
  facebook: z.string().max(100).optional().or(z.literal('')),
  linkedin: z.string().max(100).optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export type PortfolioFormData = z.infer<typeof portfolioSchema>