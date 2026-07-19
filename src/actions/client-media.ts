'use server'

import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'

export async function uploadClientMedia(clientPageId: string, formData: FormData) {
  const user = await requireUser()
  const page = await prisma.clientPage.findFirst({
    where: { id: clientPageId, client: { portfolio: { userId: user.id } } },
  })
  if (!page) {
    return { success: false, error: 'Page not found' }
  }
  const file = formData.get('file') as File | null
  const categoryId = formData.get('categoryId') as string | null

  if (!file) {
    return { success: false, error: 'No file provided' }
  }
  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
  const isVideo = file.type.startsWith('video/')
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'memoir/client-pages',
      public_id: `${clientPageId}-${Date.now()}`,
      resource_type: isVideo ? 'video' : 'image',
      transformation: isVideo ? undefined : [{ width: 2000, height: 2000, crop: 'limit' }],
    })
    const currentCount = await prisma.clientMedia.count({ where: { clientPageId } })
    const media = await prisma.clientMedia.create({
      data: {
        clientPageId,
        url: result.secure_url,
        publicId: result.public_id,
        mediaType: isVideo ? 'video' : 'image',
        categoryId: categoryId || null,
        width: result.width ?? null,
        height: result.height ?? null,
        sortOrder: currentCount,
      },
    })
    revalidatePath(`/dashboard/clients/${page.clientId}/pages/${clientPageId}/edit`)
    return { success: true, media }
  } catch (error) {
    console.error('Client media upload error:', error)
    return { success: false, error: 'Failed to upload media' }
  }
}

export async function deleteClientMedia(mediaId: string) {
  const user = await requireUser()

  const media = await prisma.clientMedia.findFirst({
    where: {
      id: mediaId,
      clientPage: { client: { portfolio: { userId: user.id } } },
    },
    include: { clientPage: { select: { id: true, clientId: true } } },
  })

  if (!media) {
    return { success: false, error: 'Media not found' }
  }

  await cloudinary.uploader
    .destroy(media.publicId, { resource_type: media.mediaType === 'video' ? 'video' : 'image' })
    .catch(() => null)

  await prisma.clientMedia.delete({ where: { id: mediaId } })

  revalidatePath(`/dashboard/clients/${media.clientPage.clientId}/pages/${media.clientPage.id}/edit`)

  return { success: true }
}

export async function reorderClientMedia(clientPageId: string, mediaIds: string[]) {
  const user = await requireUser()

  const page = await prisma.clientPage.findFirst({
    where: { id: clientPageId, client: { portfolio: { userId: user.id } } },
  })

  if (!page) {
    return { success: false, error: 'Page not found' }
  }

  await Promise.all(
    mediaIds.map((id, index) =>
      prisma.clientMedia.update({ where: { id }, data: { sortOrder: index } })
    )
  )

  revalidatePath(`/dashboard/clients/${page.clientId}/pages/${clientPageId}/edit`)

  return { success: true }
}