'use server'

import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function verifyPageAccess(clientPageId: string, userId: string) {
  const page = await prisma.clientPage.findFirst({
    where: { id: clientPageId, client: { portfolio: { userId } } },
  })
  return page
}

export async function getMediaCategories(clientPageId: string) {
  const user = await requireUser()
  const page = await verifyPageAccess(clientPageId, user.id)
  if (!page) return []

  return prisma.clientMediaCategory.findMany({
    where: { clientPageId },
    include: { _count: { select: { media: true } } },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function createMediaCategory(clientPageId: string, name: string) {
  const user = await requireUser()
  const page = await verifyPageAccess(clientPageId, user.id)
  if (!page) return { success: false, error: 'Page not found' }

  const trimmed = name.trim()
  if (!trimmed) return { success: false, error: 'Category name is required' }

  const existing = await prisma.clientMediaCategory.findFirst({
    where: { clientPageId, name: trimmed },
  })
  if (existing) return { success: true, category: existing }

  const count = await prisma.clientMediaCategory.count({ where: { clientPageId } })

  const category = await prisma.clientMediaCategory.create({
    data: { clientPageId, name: trimmed, sortOrder: count },
  })

  revalidatePath(`/dashboard/clients/${page.clientId}/pages/${clientPageId}/edit`)

  return { success: true, category }
}

export async function renameMediaCategory(categoryId: string, name: string) {
  const user = await requireUser()

  const category = await prisma.clientMediaCategory.findFirst({
    where: { id: categoryId, clientPage: { client: { portfolio: { userId: user.id } } } },
  })
  if (!category) return { success: false, error: 'Category not found' }

  const trimmed = name.trim()
  if (!trimmed) return { success: false, error: 'Category name is required' }

  await prisma.clientMediaCategory.update({
    where: { id: categoryId },
    data: { name: trimmed },
  })

  revalidatePath(`/dashboard/clients/${category.clientPageId}`)

  return { success: true }
}

export async function deleteMediaCategory(categoryId: string) {
  const user = await requireUser()

  const category = await prisma.clientMediaCategory.findFirst({
    where: { id: categoryId, clientPage: { client: { portfolio: { userId: user.id } } } },
  })
  if (!category) return { success: false, error: 'Category not found' }

  // Photos in this category become uncategorized (categoryId set to null via onDelete: SetNull)
  await prisma.clientMediaCategory.delete({ where: { id: categoryId } })

  revalidatePath(`/dashboard/clients/${category.clientPageId}`)

  return { success: true }
}