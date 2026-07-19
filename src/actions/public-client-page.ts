'use server'

import { prisma } from '@/lib/prisma'

export async function getPublicClientPage(slug: string) {
  const page = await prisma.clientPage.findUnique({
    where: { slug, isPublished: true },
    include: {
      client: {
        select: {
          displayName: true,
          portfolio: {
            select: { businessName: true, logoUrl: true },
          },
        },
      },
      media: { orderBy: { sortOrder: 'asc' } },
      mediaCategories: {
        orderBy: { sortOrder: 'asc' },
        include: {
          media: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
  })

  return page
}