'use server'

import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { serviceSchema } from '@/lib/validations/service'
import { revalidatePath } from 'next/cache'

export async function getServices() {
  const user = await requireUser()

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })

  if (!portfolio) return []

  return prisma.service.findMany({
    where: { portfolioId: portfolio.id },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function createService(data: unknown) {
  const user = await requireUser()

  const parsed = serviceSchema.safeParse(data)
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

  const existing = await prisma.service.findFirst({
    where: { portfolioId: portfolio.id, title: parsed.data.title },
  })

  if (existing) {
    return { success: false, error: 'A service with this title already exists' }
  }

  const count = await prisma.service.count({ where: { portfolioId: portfolio.id } })

  const service = await prisma.service.create({
    data: {
      portfolioId: portfolio.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      sortOrder: count,
    },
  })

  revalidatePath('/dashboard/services')

  return { success: true, service }
}

export async function updateService(serviceId: string, data: unknown) {
  const user = await requireUser()

  const parsed = serviceSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, portfolio: { userId: user.id } },
  })

  if (!service) {
    return { success: false, error: 'Service not found' }
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
    },
  })

  revalidatePath('/dashboard/services')

  return { success: true }
}

export async function deleteService(serviceId: string) {
  const user = await requireUser()

  const service = await prisma.service.findFirst({
    where: { id: serviceId, portfolio: { userId: user.id } },
  })

  if (!service) {
    return { success: false, error: 'Service not found' }
  }

  await prisma.service.delete({ where: { id: serviceId } })

  revalidatePath('/dashboard/services')

  return { success: true }
}

export async function reorderServices(serviceIds: string[]) {
  const user = await requireUser()

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })

  if (!portfolio) {
    return { success: false, error: 'Portfolio not found' }
  }

  await Promise.all(
    serviceIds.map((id, index) =>
      prisma.service.update({
        where: { id, portfolioId: portfolio.id },
        data: { sortOrder: index },
      })
    )
  )

  revalidatePath('/dashboard/services')

  return { success: true }
}