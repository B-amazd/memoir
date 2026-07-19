'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadPortfolioImage, removePortfolioImage } from '@/actions/upload'
import { compressImage } from '@/lib/compress-image'

interface ImageUploadProps {
  target: 'logo' | 'hero'
  currentUrl: string | null
  label: string
  aspectHint: string
}

export function ImageUpload({ target, currentUrl, label, aspectHint }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 20 * 1024 * 1024) {
      setError('Image must be under 20MB')
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)

    const compressedFile = await compressImage(file)
    const formData = new FormData()
    formData.append('file', compressedFile)

    startTransition(async () => {
      const result = await uploadPortfolioImage(formData, target)
      if (result.success && result.url) {
        setPreviewUrl(result.url)
      } else {
        setError(result.error ?? 'Upload failed')
        setPreviewUrl(currentUrl)
      }
    })
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removePortfolioImage(target)
      if (result.success) {
        setPreviewUrl(null)
      }
    })
  }

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-[0.1em]">
        {label}
      </label>

      <div
        className="relative rounded-xl overflow-hidden flex items-center justify-center group"
        style={{
          height: target === 'logo' ? '100px' : '160px',
          width: target === 'logo' ? '100px' : '100%',
          background: previewUrl
            ? `url(${previewUrl}) center/cover`
            : 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {!previewUrl && (
          <span className="text-xs text-white/20 italic px-4 text-center">{aspectHint}</span>
        )}

        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-xs text-white">Uploading...</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#080102]"
            style={{ background: '#C6A46C' }}
          >
            {previewUrl ? 'Change' : 'Upload'}
          </button>
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
              style={{ background: 'rgba(220,38,38,0.7)' }}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}