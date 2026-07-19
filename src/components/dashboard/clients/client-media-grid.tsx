'use client'

import { useRef, useState } from 'react'
import { uploadClientMedia, deleteClientMedia } from '@/actions/client-media'
import { useToast } from '@/lib/toast'
import { compressImage } from '@/lib/compress-image'

interface MediaItem {
  id: string
  url: string
  mediaType: string
  categoryId: string | null
}

interface OptimisticItem extends MediaItem {
  isUploading?: boolean
}

interface Category {
  id: string
  name: string
}

interface ClientMediaGridProps {
  clientPageId: string
  initialMedia: MediaItem[]
  categories: Category[]
}

export function ClientMediaGrid({ clientPageId, initialMedia, categories }: ClientMediaGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [media, setMedia] = useState<OptimisticItem[]>(initialMedia)
  const [activeCategoryId, setActiveCategoryId] = useState<string>('')
  const { showToast } = useToast()

  function categoryName(id: string | null) {
    if (!id) return 'Uncategorized'
    return categories.find((c) => c.id === id)?.name ?? 'Uncategorized'
  }

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
        {
          id: tempId,
          url: localUrl,
          mediaType: isVideo ? 'video' : 'image',
          categoryId: activeCategoryId || null,
          isUploading: true,
        },
      ])

      const fileToUpload = isVideo ? file : await compressImage(file)
      const formData = new FormData()
      formData.append('file', fileToUpload)
      if (activeCategoryId) formData.append('categoryId', activeCategoryId)

      uploadClientMedia(clientPageId, formData).then((result) => {
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
    deleteClientMedia(mediaId).then((result) => {
      if (!result.success) {
        showToast('Failed to delete media', 'error')
      }
    })
  }

  const categoryIdsPresent = Array.from(new Set(media.map((m) => m.categoryId).filter((c): c is string => !!c)))

  return (
    <div className="space-y-4">

      <div className="space-y-2">
        <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-[0.1em]">
          Category for next upload (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategoryId('')}
            className="text-xs px-3 py-1.5 rounded-full transition-colors"
            style={
              !activeCategoryId
                ? { background: 'rgba(198,164,108,0.2)', color: '#C6A46C', border: '1px solid rgba(198,164,108,0.4)' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            None
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className="text-xs px-3 py-1.5 rounded-full transition-colors"
              style={
                activeCategoryId === cat.id
                  ? { background: 'rgba(198,164,108,0.2)', color: '#C6A46C', border: '1px solid rgba(198,164,108,0.4)' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
        {categories.length === 0 && (
          <p className="text-[10px] text-white/25">
            No categories yet. Add one in the "Photo Categories" section above to organize uploads.
          </p>
        )}
      </div>

      {categoryIdsPresent.map((catId) => (
        <div key={catId} className="space-y-2">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em]">
            {categoryName(catId)}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {media
              .filter((m) => m.categoryId === catId)
              .map((item) => (
                <MediaTile key={item.id} item={item} onDelete={handleDelete} />
              ))}
          </div>
        </div>
      ))}

      {media.some((m) => !m.categoryId) && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em]">Uncategorized</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {media.filter((m) => !m.categoryId).map((item) => (
              <MediaTile key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)' }}
      >
        <span className="text-lg text-white/20">+</span>
        <span className="text-xs text-white/30">
          Add Media{activeCategoryId ? ` to "${categoryName(activeCategoryId)}"` : ''}
        </span>
      </button>

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

function MediaTile({ item, onDelete }: { item: OptimisticItem; onDelete: (id: string) => void }) {
  return (
    <div
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
          onClick={() => onDelete(item.id)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(220,38,38,0.85)' }}
        >
          ✕
        </button>
      )}
    </div>
  )
}