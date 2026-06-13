import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function getCurrentUser() {
  const { userId } = await auth()

  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      portfolio: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  })

  return user
}

// Throws if not authenticated — use in protected Server Actions
export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

// Throws if not ADMIN — use in admin Server Actions
export async function requireAdmin() {
  const user = await requireUser()

  if (user.role !== UserRole.ADMIN) {
    throw new Error('Forbidden')
  }

  return user
}