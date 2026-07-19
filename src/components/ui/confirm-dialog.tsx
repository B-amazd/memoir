'use client'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isDangerous?: boolean
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm">
        <div
          className="absolute rounded-2xl"
          style={{ top: '14px', left: '14px', right: '-14px', bottom: '-14px', background: '#2a0f16' }}
        />

        <div
          className="relative rounded-2xl px-7 py-8 text-center"
          style={{ background: '#1a0508', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <h3 className="text-[17px] font-medium text-white mb-2">{title}</h3>
          <p className="text-[13px] text-white/45 leading-relaxed mb-6">{description}</p>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="flex-1 rounded-[10px] text-[13px] font-medium py-2.5 transition-all duration-150 hover:bg-white/10 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 rounded-[10px] text-[13px] font-semibold py-2.5 transition-all duration-150 hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A46C]/40"
              style={{
                background: 'linear-gradient(135deg, #C6A46C, #D8BA86)',
                color: '#14060c',
                boxShadow: '0 4px 16px rgba(198,164,108,0.3)',
              }}
            >
              {isPending ? 'Deleting...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}