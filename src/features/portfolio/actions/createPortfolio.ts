'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { createPortfolioSchema } from '@/features/portfolio/schemas'

export async function createPortfolio(input: {
  businessName: string
  slug: string
}) {
  const user = await requireUser()

  if (user.portfolio) {
    redirect('/dashboard')
  }

  const validated = createPortfolioSchema.safeParse(input)

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const existingSlug = await prisma.portfolio.findUnique({
    where: { slug: validated.data.slug },
  })

  if (existingSlug) {
    return { error: 'This URL is already taken. Please choose a different one.' }
  }

  await prisma.portfolio.create({
    data: {
      userId: user.id,
      businessName: validated.data.businessName,
      slug: validated.data.slug,
    },
  })

  redirect('/dashboard')
}