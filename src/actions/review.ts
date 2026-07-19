'use server'

import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected') {
  const user = await requireUser()

  const review = await prisma.review.findFirst({
    where: { id: reviewId, portfolio: { userId: user.id } },
    include: { clientPage: { select: { id: true, clientId: true } } },
  })

  if (!review) {
    return { success: false, error: 'Review not found' }
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { status },
  })

  revalidatePath(`/dashboard/clients/${review.clientPage.clientId}/pages/${review.clientPage.id}/edit`)
  revalidatePath('/dashboard/reviews')

  return { success: true }
}

export async function deleteReview(reviewId: string) {
  const user = await requireUser()

  const review = await prisma.review.findFirst({
    where: { id: reviewId, portfolio: { userId: user.id } },
    include: { clientPage: { select: { id: true, clientId: true } } },
  })

  if (!review) {
    return { success: false, error: 'Review not found' }
  }

  await prisma.review.delete({ where: { id: reviewId } })

  revalidatePath(`/dashboard/clients/${review.clientPage.clientId}/pages/${review.clientPage.id}/edit`)
  revalidatePath('/dashboard/reviews')

  return { success: true }
}