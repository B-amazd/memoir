'use server'

import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/validations/project'
import { revalidatePath } from 'next/cache'
import { DEFAULT_CATEGORIES } from '@/lib/constants/categories'

export async function createCategory(data: unknown) {
  const user = await requireUser()

  const parsed = categorySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })

  if (!portfolio) {
    return { success: false, error: 'Portfolio not found' }
  }

  const existing = await prisma.category.findFirst({
    where: { portfolioId: portfolio.id, name: parsed.data.name },
  })

  if (existing) {
    return { success: true, category: existing }
  }

  const category = await prisma.category.create({
    data: {
      portfolioId: portfolio.id,
      name: parsed.data.name,
    },
  })

  revalidatePath('/dashboard/projects')

  return { success: true, category }
}

export async function getCategories() {
  const user = await requireUser()

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })

  if (!portfolio) return []

  const existing = await prisma.category.findMany({
    where: { portfolioId: portfolio.id },
    orderBy: { name: 'asc' },
  })

  if (existing.length > 0) {
    return existing
  }

  // Seed predefined categories on first visit
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((name) => ({ portfolioId: portfolio.id, name })),
    skipDuplicates: true,
  })

  return prisma.category.findMany({
    where: { portfolioId: portfolio.id },
    orderBy: { name: 'asc' },
  })
}