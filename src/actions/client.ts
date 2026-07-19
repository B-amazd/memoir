'use server'

import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clientSchema } from '@/lib/validations/client'
import { revalidatePath } from 'next/cache'

export async function getClients() {
  const user = await requireUser()

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })

  if (!portfolio) return []

  return prisma.client.findMany({
    where: { portfolioId: portfolio.id },
    include: { _count: { select: { clientPages: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getClientById(clientId: string) {
  const user = await requireUser()

  const client = await prisma.client.findFirst({
    where: { id: clientId, portfolio: { userId: user.id } },
    include: {
      clientPages: {
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { media: true, reviews: true } } },
      },
    },
  })

  return client
}

export async function createClient(data: unknown) {
  const user = await requireUser()

  const parsed = clientSchema.safeParse(data)
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

  const client = await prisma.client.create({
    data: {
      portfolioId: portfolio.id,
      displayName: parsed.data.displayName,
      clientType: parsed.data.clientType,
      contactPerson: parsed.data.contactPerson || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
    },
  })

  revalidatePath('/dashboard/clients')

  return { success: true, client }
}

export async function updateClient(clientId: string, data: unknown) {
  const user = await requireUser()

  const parsed = clientSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, portfolio: { userId: user.id } },
  })

  if (!client) {
    return { success: false, error: 'Client not found' }
  }

  await prisma.client.update({
    where: { id: clientId },
    data: {
      displayName: parsed.data.displayName,
      clientType: parsed.data.clientType,
      contactPerson: parsed.data.contactPerson || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
    },
  })

  revalidatePath('/dashboard/clients')
  revalidatePath(`/dashboard/clients/${clientId}`)

  return { success: true }
}

export async function deleteClient(clientId: string) {
  const user = await requireUser()

  const client = await prisma.client.findFirst({
    where: { id: clientId, portfolio: { userId: user.id } },
  })

  if (!client) {
    return { success: false, error: 'Client not found' }
  }

  await prisma.client.delete({ where: { id: clientId } })

  revalidatePath('/dashboard/clients')

  return { success: true }
}