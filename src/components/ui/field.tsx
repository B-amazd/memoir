import { cn } from '@/lib/utils'

export const inputStyle = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
} as React.CSSProperties

export const inputClass =
  'w-full px-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:ring-2 focus:ring-[#C6A46C]/20 focus:border-[#C6A46C]/40 hover:border-white/15'

interface FieldProps {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-[0.1em]">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[#C6A46C]">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input style={inputStyle} className={cn(inputClass, props.className)} {...props} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      style={inputStyle}
      className={cn(inputClass, 'resize-none', props.className)}
      {...props}
    />
  )
}