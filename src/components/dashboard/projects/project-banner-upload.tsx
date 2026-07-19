'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadProjectBanner, removeProjectBanner } from '@/actions/project-banner'
import { useToast } from '@/lib/toast'
import { compressImage } from '@/lib/compress-image'

interface ProjectBannerUploadProps {
  projectId: string
  currentUrl: string | null
}

export function ProjectBannerUpload({ projectId, currentUrl }: ProjectBannerUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl)
  const { showToast } = useToast()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 20 * 1024 * 1024) {
      showToast('Image must be under 20MB', 'error')
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)

    const compressedFile = await compressImage(file, { maxDimension: 1200 })
    const formData = new FormData()
    formData.append('file', compressedFile)

    startTransition(async () => {
      const result = await uploadProjectBanner(projectId, formData)
      if (result.success && result.url) {
        setPreviewUrl(result.url)
        showToast('Cover image updated')
      } else {
        showToast(result.error ?? 'Upload failed', 'error')
        setPreviewUrl(currentUrl)
      }
    })
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeProjectBanner(projectId)
      if (result.success) {
        setPreviewUrl(null)
        showToast('Cover image removed')
      }
    })
  }

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-[0.1em]">
        Project Cover
      </label>
      <p className="text-[10px] text-white/25 -mt-1">
        Main image shown on your project card (portrait or square works best)
      </p>

      <div
        className="relative rounded-xl overflow-hidden flex items-center justify-center group"
        style={{
          height: '220px',
          width: '176px',
          background: previewUrl ? `url(${previewUrl}) center/cover` : 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {!previewUrl && (
          <span className="text-[10px] text-white/20 italic px-3 text-center">
            Portrait or square image
          </span>
        )}

        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-[10px] text-white">Uploading...</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
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
    </div>
  )
}