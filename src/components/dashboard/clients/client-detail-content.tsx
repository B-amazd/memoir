'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteClient } from '@/actions/client'
import { useToast } from '@/lib/toast'
import { ClientForm } from './client-form'
import { ClientCoverUpload } from './client-cover-upload'
import { GlassCard, SectionHeader } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface ClientPage {
  id: string
  title: string
  slug: string
  eventDate: Date | null
  isPublished: boolean
  _count: { media: number; reviews: number }
}

interface ClientDetail {
  id: string
  displayName: string
  clientType: 'individual' | 'organization'
  contactPerson: string | null
  email: string | null
  phone: string | null
  coverImageUrl: string | null
  clientPages: ClientPage[]
}

interface ClientDetailContentProps {
  client: ClientDetail
}

export function ClientDetailContent({ client }: ClientDetailContentProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  function handleDelete() {
    setIsDeleting(true)
    deleteClient(client.id).then((result) => {
      if (result.success) {
        showToast('Client deleted')
        router.push('/dashboard/clients')
      } else {
        showToast(result.error ?? 'Failed to delete', 'error')
        setIsDeleting(false)
        setShowDeleteConfirm(false)
      }
    })
  }

  return (
    <div className="max-w-2xl space-y-5">

      <ClientCoverUpload
        clientId={client.id}
        currentUrl={client.coverImageUrl}
        displayName={client.displayName}
      />

      <GlassCard>
        <div className="flex items-center justify-between mb-1">
          <SectionHeader title="Client Information" />
          {!isEditing && (
            <Button type="button" variant="premium-ghost" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>

        {isEditing ? (
          <ClientForm
            client={client}
            onSuccess={() => {
              setIsEditing(false)
              router.refresh()
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="space-y-3 pt-2">
            <DetailRow label="Name" value={client.displayName} />
            <DetailRow label="Type" value={client.clientType} capitalize />
            {client.contactPerson && <DetailRow label="Contact Person" value={client.contactPerson} />}
            {client.email && <DetailRow label="Email" value={client.email} />}
            {client.phone && <DetailRow label="Phone" value={client.phone} />}
          </div>
        )}
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-1">
          <SectionHeader title="Event Pages" />
          <Link
            href={`/dashboard/clients/${client.id}/pages/new`}
            className="text-xs font-medium text-[#C6A46C] hover:text-[#d4b47c] transition-colors"
          >
            + New Page
          </Link>
        </div>

        {client.clientPages.length === 0 ? (
          <p className="text-xs text-white/30 pt-2">No pages yet for this client.</p>
        ) : (
          <div className="space-y-2 pt-2">
            {client.clientPages.map((page) => (
              <Link
                key={page.id}
                href={`/dashboard/clients/${client.id}/pages/${page.id}/edit`}
                className="flex items-center justify-between p-3 rounded-xl transition-all duration-150 hover:bg-white/8 hover:border-[#C6A46C]/30 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A46C]/40"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{page.title}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    {page.eventDate ? new Date(page.eventDate).toLocaleDateString() : 'No date set'}
                    {' · '}{page._count.media} media · {page._count.reviews} reviews
                  </p>
                </div>
                <span
                  className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                  style={
                    page.isPublished
                      ? { background: 'rgba(198,164,108,0.15)', color: '#C6A46C' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }
                  }
                >
                  {page.isPublished ? 'Live' : 'Draft'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </GlassCard>

      <div className="flex justify-end pt-2 pb-10">
        <Button type="button" variant="premium-danger" onClick={() => setShowDeleteConfirm(true)}>
          Delete Client
        </Button>
      </div>
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete this client?"
        description={`This will permanently delete ${client.displayName} and all their event pages. This cannot be undone.`}
        confirmLabel="Delete Client"
        isPending={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

    </div>
  )
}

function DetailRow({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/30">{label}</span>
      <span className={`text-white font-medium ${capitalize ? 'capitalize' : ''}`}>{value}</span>
    </div>
  )
}