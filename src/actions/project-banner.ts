'use server'

import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'

export async function uploadProjectBanner(projectId: string, formData: FormData) {
  const user = await requireUser()

  const project = await prisma.project.findFirst({
    where: { id: projectId, portfolio: { userId: user.id } },
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
      folder: 'memoir/project-banners',
      public_id: `${projectId}-banner-${Date.now()}`,
      overwrite: true,
      transformation: [{ width: 800, height: 1000, crop: 'fill' }],
    })

    if (project.bannerImagePublicId) {
      await cloudinary.uploader.destroy(project.bannerImagePublicId).catch(() => null)
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        bannerImageUrl: result.secure_url,
        bannerImagePublicId: result.public_id,
      },
    })

    revalidatePath(`/dashboard/projects/${projectId}/edit`)
    revalidatePath('/dashboard/projects')

    return { success: true, url: result.secure_url }
  } catch (error) {
    console.error('Banner upload error:', error)
    return { success: false, error: 'Failed to upload banner image' }
  }
}

export async function removeProjectBanner(projectId: string) {
  const user = await requireUser()

  const project = await prisma.project.findFirst({
    where: { id: projectId, portfolio: { userId: user.id } },
  })

  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  if (project.bannerImagePublicId) {
    await cloudinary.uploader.destroy(project.bannerImagePublicId).catch(() => null)
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { bannerImageUrl: null, bannerImagePublicId: null },
  })

  revalidatePath(`/dashboard/projects/${projectId}/edit`)
  revalidatePath('/dashboard/projects')

  return { success: true }
}