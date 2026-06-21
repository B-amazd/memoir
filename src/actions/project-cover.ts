'use server'

import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'

export async function uploadProjectCover(projectId: string, formData: FormData) {
  const user = await requireUser()

  const project = await prisma.project.findFirst({
    where: { id: projectId, portfolio: { userId: user.id } },
    select: { id: true, coverImagePublicId: true },
  })

  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'memoir/project-covers',
      public_id: `${projectId}-cover-${Date.now()}`,
      overwrite: true,
      transformation: [{ width: 400, height: 400, crop: 'fill' }],
    })

    if (project.coverImagePublicId) {
      await cloudinary.uploader.destroy(project.coverImagePublicId).catch(() => null)
    }

    await prisma.project.update({
      where: { id: projectId },
      // cast to any because generated Prisma types may differ from runtime model
      data: ({
        coverImageUrl: result.secure_url,
        coverImagePublicId: result.public_id,
      } as any),
    })

    revalidatePath(`/dashboard/projects/${projectId}/edit`)
    revalidatePath('/dashboard/projects')

    return { success: true, url: result.secure_url }
  } catch (error) {
    console.error('Cover upload error:', error)
    return { success: false, error: 'Failed to upload cover image' }
  }
}

export async function removeProjectCover(projectId: string) {
  const user = await requireUser()

  const project = await prisma.project.findFirst({
    where: { id: projectId, portfolio: { userId: user.id } },
    select: { id: true, coverImagePublicId: true },
  })

  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  if (project.coverImagePublicId) {
    await cloudinary.uploader.destroy(project.coverImagePublicId).catch(() => null)
  }

  await prisma.project.update({
    where: { id: projectId },
    data: ({ coverImageUrl: null, coverImagePublicId: null } as any),
  })

  revalidatePath(`/dashboard/projects/${projectId}/edit`)
  revalidatePath('/dashboard/projects')

  return { success: true }
}