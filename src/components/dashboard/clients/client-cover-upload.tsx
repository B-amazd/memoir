'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadClientCover, removeClientCover } from '@/actions/client-cover'
import { useToast } from '@/lib/toast'
import { compressImage } from '@/lib/compress-image'

interface ClientCoverUploadProps {
  clientId: string
  currentUrl: string | null
  displayName: string
}

export function ClientCoverUpload({ clientId, currentUrl, displayName }: ClientCoverUploadProps) {
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

  const compressedFile = await compressImage(file)
  const formData = new FormData()
  formData.append('file', compressedFile)

  startTransition(async () => {
    const result = await uploadClientCover(clientId, formData)
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
      const result = await removeClientCover(clientId)
      if (result.success) {
        setPreviewUrl(null)
        showToast('Cover image removed')
      }
    })
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden flex items-center justify-center group"
      style={{
        height: '180px',
        background: previewUrl ? `url(${previewUrl}) center/cover` : 'linear-gradient(135deg, rgba(107,49,64,0.6), rgba(8,2,5,0.9))',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {!previewUrl && (
        <span className="text-4xl font-bold text-white/15">{displayName.charAt(0).toUpperCase()}</span>
      )}

      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-xs text-white">Uploading...</span>
        </div>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#080102]"
          style={{ background: '#C6A46C' }}
        >
          {previewUrl ? 'Change Cover' : 'Upload Cover'}
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