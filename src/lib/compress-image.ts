/**
 * Compresses an image file in the browser before upload.
 * Resizes to a max dimension and re-encodes as JPEG at a given quality.
 */
export async function compressImage(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  const { maxDimension = 2000, quality = 0.85 } = options

  // Skip compression for non-images (e.g. videos) or already-small files
  if (!file.type.startsWith('image/') || file.size < 1.5 * 1024 * 1024) {
    return file
  }

  const imageBitmap = await createImageBitmap(file)

  let { width, height } = imageBitmap

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height / width) * maxDimension)
      width = maxDimension
    } else {
      width = Math.round((width / height) * maxDimension)
      height = maxDimension
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.drawImage(imageBitmap, 0, 0, width, height)

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  )

  if (!blob) return file

  // Only use the compressed version if it's actually smaller
  if (blob.size >= file.size) return file

  const compressedFile = new File(
    [blob],
    file.name.replace(/\.[^.]+$/, '.jpg'),
    { type: 'image/jpeg' }
  )

  return compressedFile
}