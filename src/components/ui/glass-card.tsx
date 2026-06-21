import { cn } from '@/lib/utils'

const glassCardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '16px',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
} as React.CSSProperties

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function GlassCard({ children, className, style, ...props }: GlassCardProps) {
  return (
    <div
      className={cn('p-6 space-y-4', className)}
      style={{ ...glassCardStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  )
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
      <div
        className="w-2 h-2 rounded-full bg-[#C6A46C]"
        style={{ boxShadow: '0 0 8px rgba(198,164,108,0.9)' }}
      />
      <h2 className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#C6A46C]">
        {title}
      </h2>
    </div>
  )
}