export function SkeletonCard({ height = 'h-40' }: { height?: string }) {
  return (
    <div
      className={`${height} rounded-2xl animate-pulse`}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
    />
  )
}

export function SkeletonGrid({ count = 4, height = 'h-40' }: { count?: number; height?: string }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={height} />
      ))}
    </div>
  )
}