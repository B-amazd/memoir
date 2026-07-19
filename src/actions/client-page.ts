'use server'

import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clientPageSchema } from '@/lib/validations/client-page'
import { revalidatePath } from 'next/cache'

export async function getClientPageById(pageId: string) {
  const user = await requireUser()

  const page = await prisma.clientPage.findFirst({
    where: { id: pageId, client: { portfolio: { userId: user.id } } },
    include: {
      client: { select: { id: true, displayName: true } },
      media: { orderBy: { sortOrder: 'asc' } },
      mediaCategories: {
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { media: true } } },
      },
      reviews: { orderBy: { createdAt: 'desc' } },
    },
  })

  return page
}

export async function createClientPage(clientId: string, data: unknown) {
  const user = await requireUser()

  const parsed = clientPageSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, portfolio: { userId: user.id } },
  })

  if (!client) {
    return { success: false, error: 'Client not found' }
  }

  const existingSlug = await prisma.clientPage.findUnique({
    where: { slug: parsed.data.slug },
  })

  if (existingSlug) {
    return { success: false, error: 'This slug is already taken' }
  }

  const page = await prisma.clientPage.create({
    data: {
      clientId,
      title: parsed.data.title,
      slug: parsed.data.slug,
      eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
      message: parsed.data.message || null,
      isPublished: parsed.data.isPublished,
      publishedAt: parsed.data.isPublished ? new Date() : null,
    },
  })

  revalidatePath(`/dashboard/clients/${clientId}`)

  return { success: true, page }
}

export async function updateClientPage(pageId: string, data: unknown) {
  const user = await requireUser()

  const parsed = clientPageSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }

  const page = await prisma.clientPage.findFirst({
    where: { id: pageId, client: { portfolio: { userId: user.id } } },
  })

  if (!page) {
    return { success: false, error: 'Page not found' }
  }

  if (parsed.data.slug !== page.slug) {
    const existingSlug = await prisma.clientPage.findUnique({
      where: { slug: parsed.data.slug },
    })
    if (existingSlug) {
      return { success: false, error: 'This slug is already taken' }
    }
  }

  const wasPublished = page.isPublished
  const willBePublished = parsed.data.isPublished

  await prisma.clientPage.update({
    where: { id: pageId },
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
      message: parsed.data.message || null,
      isPublished: parsed.data.isPublished,
      publishedAt: !wasPublished && willBePublished ? new Date() : page.publishedAt,
    },
  })

  revalidatePath(`/dashboard/clients/${page.clientId}`)
  revalidatePath(`/dashboard/clients/${page.clientId}/pages/${pageId}/edit`)

  return { success: true }
}

export async function deleteClientPage(pageId: string) {
  const user = await requireUser()

  const page = await prisma.clientPage.findFirst({
    where: { id: pageId, client: { portfolio: { userId: user.id } } },
  })

  if (!page) {
    return { success: false, error: 'Page not found' }
  }

  await prisma.clientPage.delete({ where: { id: pageId } })

  revalidatePath(`/dashboard/clients/${page.clientId}`)

  return { success: true, clientId: page.clientId }
}