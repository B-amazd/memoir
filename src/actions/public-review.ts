'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const publicReviewSchema = z.object({
  reviewerName: z.string().min(1, 'Name is required').max(100),
  rating: z.number().min(1).max(5),
  review: z.string().min(1, 'Review is required').max(1000),
})

export async function submitReview(slug: string, data: unknown) {
  const parsed = publicReviewSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }

  const clientPage = await prisma.clientPage.findUnique({
    where: { slug, isPublished: true },
    select: {
      id: true,
      client: { select: { portfolioId: true } },
    },
  })

  if (!clientPage) {
    return { success: false, error: 'Page not found' }
  }

  const portfolioId = clientPage.client.portfolioId

  await prisma.review.create({
    data: {
      portfolioId,
      clientPageId: clientPage.id,
      reviewerName: parsed.data.reviewerName,
      rating: parsed.data.rating,
      review: parsed.data.review,
      status: 'pending',
    },
  })

  revalidatePath(`/c/${slug}`)

  return { success: true }
}