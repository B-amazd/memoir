'use server'

import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'

type UploadTarget = 'logo' | 'hero'

export async function uploadPortfolioImage(formData: FormData, target: UploadTarget) {
  const user = await requireUser()

  const file = formData.get('file') as File | null
  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  // Convert file to base64 for Cloudinary upload
  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

  const folder = target === 'logo' ? 'memoir/logos' : 'memoir/hero-images'

  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder,
      public_id: `${user.id}-${target}-${Date.now()}`,
      overwrite: true,
      resource_type: 'image',
      transformation:
        target === 'logo'
          ? [{ width: 400, height: 400, crop: 'fit' }]
          : [{ width: 1600, height: 900, crop: 'fill' }],
    })

    // Delete old image from Cloudinary if it exists
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { userId: user.id },
      select: { logoPublicId: true, heroImagePublicId: true },
    })

    const oldPublicId =
      target === 'logo' ? existingPortfolio?.logoPublicId : existingPortfolio?.heroImagePublicId

    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId).catch(() => null)
    }

    // Update portfolio with new image
    await prisma.portfolio.update({
      where: { userId: user.id },
      data:
        target === 'logo'
          ? { logoUrl: result.secure_url, logoPublicId: result.public_id }
          : { heroImageUrl: result.secure_url, heroImagePublicId: result.public_id },
    })

    revalidatePath('/dashboard/portfolio')

    return { success: true, url: result.secure_url }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

export async function removePortfolioImage(target: UploadTarget) {
  const user = await requireUser()

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: user.id },
    select: { logoPublicId: true, heroImagePublicId: true },
  })

  const publicId = target === 'logo' ? portfolio?.logoPublicId : portfolio?.heroImagePublicId

  if (publicId) {
    await cloudinary.uploader.destroy(publicId).catch(() => null)
  }

  await prisma.portfolio.update({
    where: { userId: user.id },
    data:
      target === 'logo'
        ? { logoUrl: null, logoPublicId: null }
        : { heroImageUrl: null, heroImagePublicId: null },
  })

  revalidatePath('/dashboard/portfolio')

  return { success: true }
}