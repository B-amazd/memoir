import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function syncUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) return null

  const email = clerkUser.emailAddresses[0]?.emailAddress

  if (!email) return null

  const fullName = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(' ') || null

  const user = await prisma.user.upsert({
    where: {
      clerkId: clerkUser.id,
    },
    update: {
      email,
      fullName,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      fullName,
    },
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