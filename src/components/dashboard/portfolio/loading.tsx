export default function Loading() {
  return (
    <div className="w-full py-4">
      <div className="border-l-[3px] border-[#C6A46C] pl-4 mb-8 animate-pulse">
        <div className="h-8 w-64 bg-white/10 rounded mb-2" />
        <div className="h-4 w-96 bg-white/5 rounded" />
      </div>
      <div className="flex flex-col xl:grid xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
            />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}