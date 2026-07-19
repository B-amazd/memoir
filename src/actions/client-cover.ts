'use server'

import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'

export async function uploadClientCover(clientId: string, formData: FormData) {
  const user = await requireUser()

  const client = await prisma.client.findFirst({
    where: { id: clientId, portfolio: { userId: user.id } },
  })

  if (!client) {
    return { success: false, error: 'Client not found' }
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'memoir/client-covers',
      public_id: `${clientId}-cover-${Date.now()}`,
      overwrite: true,
      transformation: [{ width: 600, height: 600, crop: 'fill' }],
    })

    if (client.coverImagePublicId) {
      await cloudinary.uploader.destroy(client.coverImagePublicId).catch(() => null)
    }

    await prisma.client.update({
      where: { id: clientId },
      data: {
        coverImageUrl: result.secure_url,
        coverImagePublicId: result.public_id,
      },
    })

    revalidatePath('/dashboard/clients')
    revalidatePath(`/dashboard/clients/${clientId}`)

    return { success: true, url: result.secure_url }
  } catch (error) {
    console.error('Client cover upload error:', error)
    return { success: false, error: 'Failed to upload cover image' }
  }
}

export async function removeClientCover(clientId: string) {
  const user = await requireUser()

  const client = await prisma.client.findFirst({
    where: { id: clientId, portfolio: { userId: user.id } },
  })

  if (!client) {
    return { success: false, error: 'Client not found' }
  }

  if (client.coverImagePublicId) {
    await cloudinary.uploader.destroy(client.coverImagePublicId).catch(() => null)
  }

  await prisma.client.update({
    where: { id: clientId },
    data: { coverImageUrl: null, coverImagePublicId: null },
  })

  revalidatePath('/dashboard/clients')
  revalidatePath(`/dashboard/clients/${clientId}`)

  return { success: true }
}