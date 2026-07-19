'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadProjectMedia, deleteProjectMedia } from '@/actions/project-media'
import { useToast } from '@/lib/toast'
import { compressImage } from '@/lib/compress-image'

interface MediaItem {
  id: string
  url: string
  mediaType: string
}

interface OptimisticItem extends MediaItem {
  isUploading?: boolean
}

interface ProjectMediaGridProps {
  projectId: string
  initialMedia: MediaItem[]
}

export function ProjectMediaGrid({ projectId, initialMedia }: ProjectMediaGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [media, setMedia] = useState<OptimisticItem[]>(initialMedia)
  const { showToast } = useToast()

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    for (const file of files) {
      const isVideo = file.type.startsWith('video/')
      const sizeLimit = isVideo ? 50 * 1024 * 1024 : 20 * 1024 * 1024

      if (file.size > sizeLimit) {
        showToast(`${isVideo ? 'Video' : 'Image'} must be under ${isVideo ? '50MB' : '20MB'}`, 'error')
        continue
      }

      const tempId = `temp-${Math.random().toString(36).slice(2)}`
      const localUrl = URL.createObjectURL(file)

      setMedia((prev) => [
        ...prev,
        { id: tempId, url: localUrl, mediaType: isVideo ? 'video' : 'image', isUploading: true },
      ])

      const fileToUpload = isVideo ? file : await compressImage(file)
      const formData = new FormData()
      formData.append('file', fileToUpload)

      uploadProjectMedia(projectId, formData).then((result) => {
        if (result.success && result.media) {
          setMedia((prev) =>
            prev.map((item) => (item.id === tempId ? { ...result.media, isUploading: false } : item))
          )
        } else {
          setMedia((prev) => prev.filter((item) => item.id !== tempId))
          showToast(result.error ?? 'Upload failed', 'error')
        }
      })
    }

    e.target.value = ''
  }

  function handleDelete(mediaId: string) {
    setMedia((prev) => prev.filter((m) => m.id !== mediaId))
    deleteProjectMedia(mediaId).then((result) => {
      if (!result.success) {
        showToast('Failed to delete media', 'error')
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {media.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square rounded-xl overflow-hidden group"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {item.mediaType === 'video' ? (
              <video src={item.url} className="w-full h-full object-cover" />
            ) : (
              <img src={item.url} alt="" className="w-full h-full object-cover" />
            )}

            {item.isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-[10px] text-white font-medium">Uploading...</span>
              </div>
            )}

            {!item.isUploading && (
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(220,38,38,0.85)' }}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-colors"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)' }}
        >
          <span className="text-2xl text-white/20">+</span>
          <span className="text-[10px] text-white/30">Add Media</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />
    </div>
  )
}