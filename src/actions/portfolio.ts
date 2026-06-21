'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { portfolioSchema } from '@/lib/validations/portfolio'

export async function updatePortfolio(data: unknown) {
  const user = await requireUser()

  const parsed = portfolioSchema.safeParse(data)

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid data',
    }
  }

  const {
    businessName,
    slug,
    description,
    heroTitle,
    heroSubtitle,
    phone,
    email,
    instagram,
    facebook,
    linkedin,
    website,
  } = parsed.data

  const existing = await prisma.portfolio.findFirst({
    where: {
      slug,
      NOT: { userId: user.id },
    },
  })

  if (existing) {
    return { success: false, error: 'This slug is already taken' }
  }

  await prisma.portfolio.update({
    where: { userId: user.id },
    data: {
      businessName,
      slug,
      description: description || null,
      heroTitle: heroTitle || null,
      heroSubtitle: heroSubtitle || null,
      phone: phone || null,
      email: email || null,
      instagram: instagram || null,
      facebook: facebook || null,
      linkedin: linkedin || null,
      website: website || null,
    },
  })

  revalidatePath('/dashboard/portfolio')

  return { success: true }
}