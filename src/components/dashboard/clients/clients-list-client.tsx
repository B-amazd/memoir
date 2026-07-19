'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClientForm } from './client-form'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'

interface Client {
  id: string
  displayName: string
  clientType: string
  email: string | null
  phone: string | null
  coverImageUrl: string | null
  _count: { clientPages: number }
}

interface ClientsListClientProps {
  clients: Client[]
}

export function ClientsListClient({ clients }: ClientsListClientProps) {
  const router = useRouter()
  const [isAddingNew, setIsAddingNew] = useState(false)

  return (
    <div className="space-y-5">
      {isAddingNew ? (
        <GlassCard className="max-w-2xl">
          <ClientForm
            onSuccess={(clientId) => {
              router.push(`/dashboard/clients/${clientId}`)
              router.refresh()
            }}
            onCancel={() => setIsAddingNew(false)}
          />
        </GlassCard>
      ) : (
        <Button
          type="button"
          variant="premium-outline"
          onClick={() => setIsAddingNew(true)}
        >
          + New Client
        </Button>
      )}

      {clients.length === 0 && !isAddingNew && (
        <GlassCard className="max-w-2xl p-8 text-center">
          <p className="text-white/40 text-sm">No clients yet. Add your first one above.</p>
        </GlassCard>
      )}

      {clients.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="overflow-hidden rounded-2xl group hover:-translate-y-1 hover:border-[#C6A46C]/25 active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A46C]/40"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: '0 4px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="h-40 relative flex items-center justify-center overflow-hidden"
                style={{
                  background: client.coverImageUrl
                    ? `url(${client.coverImageUrl}) center/cover`
                    : 'linear-gradient(135deg, rgba(107,49,64,0.6), rgba(8,2,5,0.9))',
                }}
              >
                {!client.coverImageUrl && (
                  <span className="text-3xl font-bold text-white/15 relative z-10">
                    {client.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(8,2,5,0.7))' }}
                />
                <span
                  className="absolute bottom-3 right-3 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(198,164,108,0.2)', color: '#C6A46C' }}
                >
                  {client.clientType}
                </span>
              </div>

              <div className="p-4">
                <p className="text-sm font-semibold text-white truncate">{client.displayName}</p>
                {client.email && (
                  <p className="text-xs text-white/30 mt-0.5 truncate">{client.email}</p>
                )}
                <p className="text-[10px] text-white/25 mt-2">
                  {client._count.clientPages} page{client._count.clientPages !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}