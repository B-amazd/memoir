'use server'

import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { projectSchema } from '@/lib/validations/project'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProject(data: unknown) {
  const user = await requireUser()

  const parsed = projectSchema.safeParse(data)
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

  const { title, description, categoryId, isPublished } = parsed.data

  const project = await prisma.project.create({
    data: {
      portfolioId: portfolio.id,
      title,
      description: description || null,
      categoryId: categoryId || null,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
  })

  revalidatePath('/dashboard/projects')

  return { success: true, project }
}

export async function updateProject(projectId: string, data: unknown) {
  const user = await requireUser()

  const parsed = projectSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, portfolio: { userId: user.id } },
  })

  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  const { title, description, categoryId, isPublished } = parsed.data

  const wasPublished = project.isPublished
  const willBePublished = isPublished

  await prisma.project.update({
    where: { id: projectId },
    data: {
      title,
      description: description || null,
      categoryId: categoryId || null,
      isPublished,
      publishedAt: !wasPublished && willBePublished ? new Date() : project.publishedAt,
    },
  })

  revalidatePath('/dashboard/projects')
  revalidatePath(`/dashboard/projects/${projectId}/edit`)

  return { success: true }
}

export async function deleteProject(projectId: string) {
  const user = await requireUser()

  const project = await prisma.project.findFirst({
    where: { id: projectId, portfolio: { userId: user.id } },
  })

  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  await prisma.project.delete({ where: { id: projectId } })

  revalidatePath('/dashboard/projects')

  return { success: true }
}

export async function togglePublish(projectId: string) {
  const user = await requireUser()

  const project = await prisma.project.findFirst({
    where: { id: projectId, portfolio: { userId: user.id } },
  })

  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  const newStatus = !project.isPublished

  await prisma.project.update({
    where: { id: projectId },
    data: {
      isPublished: newStatus,
      publishedAt: newStatus && !project.publishedAt ? new Date() : project.publishedAt,
    },
  })

  revalidatePath('/dashboard/projects')

  return { success: true, isPublished: newStatus }
}

export async function getProjects() {
  const user = await requireUser()

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: user.id },
    select: { id: true },
  })

  if (!portfolio) return []

  return prisma.project.findMany({
    where: { portfolioId: portfolio.id },
    include: {
      category: true,
      media: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
      },
      _count: { select: { media: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getProjectById(projectId: string) {
  const user = await requireUser()

  const project = await prisma.project.findFirst({
    where: { id: projectId, portfolio: { userId: user.id } },
    include: {
      category: true,
      media: { orderBy: { sortOrder: 'asc' } },
    },
  })

  return project
}