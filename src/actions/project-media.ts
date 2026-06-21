'use server'

import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'

export async function uploadProjectMedia(projectId: string, formData: FormData) {
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

  const isVideo = file.type.startsWith('video/')

  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'memoir/projects',
      public_id: `${projectId}-${Date.now()}`,
      resource_type: isVideo ? 'video' : 'image',
      transformation: isVideo
        ? undefined
        : [{ width: 1600, height: 1600, crop: 'limit' }],
    })

    const currentCount = await prisma.projectMedia.count({ where: { projectId } })

    const media = await prisma.projectMedia.create({
      data: {
        projectId,
        url: result.secure_url,
        publicId: result.public_id,
        mediaType: isVideo ? 'video' : 'image',
        width: result.width ?? null,
        height: result.height ?? null,
        sortOrder: currentCount,
      },
    })

    revalidatePath(`/dashboard/projects/${projectId}/edit`)
    revalidatePath('/dashboard/projects')

    return { success: true, media }
  } catch (error) {
    console.error('Project media upload error:', error)
    return { success: false, error: 'Failed to upload media' }
  }
}

export async function deleteProjectMedia(mediaId: string) {
  const user = await requireUser()

  const media = await prisma.projectMedia.findFirst({
    where: {
      id: mediaId,
      project: { portfolio: { userId: user.id } },
    },
  })

  if (!media) {
    return { success: false, error: 'Media not found' }
  }

  await cloudinary.uploader
    .destroy(media.publicId, {
      resource_type: media.mediaType === 'video' ? 'video' : 'image',
    })
    .catch(() => null)

  await prisma.projectMedia.delete({ where: { id: mediaId } })

  revalidatePath(`/dashboard/projects/${media.projectId}/edit`)
  revalidatePath('/dashboard/projects')

  return { success: true }
}

export async function reorderProjectMedia(projectId: string, mediaIds: string[]) {
  const user = await requireUser()

  const project = await prisma.project.findFirst({
    where: { id: projectId, portfolio: { userId: user.id } },
  })

  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  await Promise.all(
    mediaIds.map((id, index) =>
      prisma.projectMedia.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  )

  revalidatePath(`/dashboard/projects/${projectId}/edit`)

  return { success: true }
}