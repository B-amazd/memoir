'use client'

import type { Portfolio } from '@prisma/client'

interface LiveValues {
  businessName: string
  slug: string
  description: string
  heroTitle: string
  heroSubtitle: string
  phone: string
  email: string
  instagram: string
  facebook: string
  website: string
}

interface Props {
  portfolio: Portfolio
  liveValues: LiveValues
  stats: {
    projectCount: number
    clientCount: number
    reviewCount: number
    serviceCount: number
  }
}

const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '16px',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
} as React.CSSProperties

export function PortfolioSidepanel({ portfolio, liveValues, stats }: Props) {
  const completionItems = [
    { label: 'Business name', done: !!liveValues.businessName },
    { label: 'Slug set', done: !!liveValues.slug },
    { label: 'Description', done: !!liveValues.description },
    { label: 'Hero title', done: !!liveValues.heroTitle },
    { label: 'Hero subtitle', done: !!liveValues.heroSubtitle },
    { label: 'Hero image', done: !!portfolio.heroImageUrl },
    { label: 'Contact info', done: !!liveValues.phone || !!liveValues.email },
    { label: 'Social links', done: !!liveValues.instagram || !!liveValues.facebook },
    { label: 'Website', done: !!liveValues.website },
  ]

  const completedCount = completionItems.filter((i) => i.done).length
  const pct = Math.round((completedCount / completionItems.length) * 100)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const nextIncomplete = completionItems.find((i) => !i.done)

  return (
    <div className="flex flex-col gap-4 xl:sticky xl:top-6">

      {/* Live Preview */}
      <div style={cardStyle} className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#C6A46C]" style={{ boxShadow: '0 0 8px rgba(198,164,108,0.9)' }} />
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#C6A46C]">Live Preview</span>
        </div>

        <div
          className="rounded-xl mb-4 flex items-center justify-center overflow-hidden"
          style={{
            height: '130px',
            background: portfolio.heroImageUrl
              ? `url(${portfolio.heroImageUrl}) center/cover`
              : 'linear-gradient(135deg, rgba(107,49,64,0.7), rgba(8,2,5,0.95))',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {!portfolio.heroImageUrl && (
            <span className="text-xs text-white/20 italic">Your hero image</span>
          )}
        </div>

        <p className="text-base font-bold text-white mb-0.5">
          {liveValues.businessName || 'Your Studio'}
        </p>
        {liveValues.heroTitle && (
          <p className="text-xs text-[#C6A46C] font-medium mb-1">{liveValues.heroTitle}</p>
        )}
        {liveValues.heroSubtitle && (
          <p className="text-xs text-white/40 mb-2">{liveValues.heroSubtitle}</p>
        )}
        {liveValues.description && (
          <p className="text-xs text-white/30 leading-relaxed mb-3 line-clamp-2">{liveValues.description}</p>
        )}
        {liveValues.phone && (
          <div className="flex items-center gap-2 text-xs text-white/35 mb-1.5">
            <span>📞</span>{liveValues.phone}
          </div>
        )}
        {liveValues.email && (
          <div className="flex items-center gap-2 text-xs text-white/35 mb-1.5">
            <span>✉️</span>{liveValues.email}
          </div>
        )}
        {liveValues.instagram && (
          <div className="flex items-center gap-2 text-xs text-white/35 mb-1.5">
            <span>📸</span>{liveValues.instagram}
          </div>
        )}

        <div
          className="flex items-center gap-1.5 mt-3 px-3 py-2 rounded-lg text-[10px] text-[#C6A46C]"
          style={{ background: 'rgba(198,164,108,0.08)', border: '1px solid rgba(198,164,108,0.2)' }}
        >
          <span>🔗</span> memoir.app/{liveValues.slug || portfolio.slug}
        </div>
      </div>

      {/* Completion */}
      <div style={cardStyle} className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#C6A46C]" style={{ boxShadow: '0 0 8px rgba(198,164,108,0.9)' }} />
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#C6A46C]">Completion</span>
          </div>
          <span className="text-2xl font-bold text-[#C6A46C]">{pct}%</span>
        </div>

        <div className="flex gap-4 mb-4">
          <svg width="90" height="90" viewBox="0 0 90 90" className="flex-shrink-0">
            <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="45" cy="45" r={radius}
              fill="none"
              stroke="url(#goldGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 45 45)"
            />
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C6A46C" />
                <stop offset="100%" stopColor="#e8c98a" />
              </linearGradient>
            </defs>
            <text x="45" y="45" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="14" fontWeight="700">
              {pct}%
            </text>
          </svg>
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold text-white mb-1">Portfolio Complete</p>
            <p className="text-xs text-white/35">{completedCount} of {completionItems.length} completed</p>
          </div>
        </div>

        <div className="space-y-2">
          {completionItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] flex-shrink-0"
                style={item.done
                  ? { background: '#C6A46C', boxShadow: '0 0 6px rgba(198,164,108,0.5)', color: '#080102' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {item.done ? '✓' : ''}
              </div>
              <span className={`text-xs ${item.done ? 'text-white/70' : 'text-white/28'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {nextIncomplete && (
          <div
            className="mt-4 p-3 rounded-xl flex items-center justify-between"
            style={{ background: 'rgba(198,164,108,0.07)', border: '1px solid rgba(198,164,108,0.15)' }}
          >
            <div>
              <p className="text-xs font-semibold text-[#C6A46C]">Complete {nextIncomplete.label}</p>
              <p className="text-[10px] text-white/30 mt-0.5">Adds 10% to your profile visibility.</p>
            </div>
            <span className="text-[#C6A46C] text-sm">›</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div style={cardStyle} className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#C6A46C]" style={{ boxShadow: '0 0 8px rgba(198,164,108,0.9)' }} />
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#C6A46C]">Quick Stats</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Projects', value: stats.projectCount, icon: '📁' },
            { label: 'Clients', value: stats.clientCount, icon: '👥' },
            { label: 'Reviews', value: stats.reviewCount, icon: '⭐' },
            { label: 'Services', value: stats.serviceCount, icon: '💼' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{stat.icon}</span>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <p className="text-[9px] uppercase tracking-wider text-white/30">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}