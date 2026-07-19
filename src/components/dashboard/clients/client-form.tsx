'use client'

import { useState, useTransition } from 'react'
import { createClient, updateClient } from '@/actions/client'
import { useToast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'

interface ExistingClient {
  id: string
  displayName: string
  clientType: 'individual' | 'organization'
  contactPerson: string | null
  email: string | null
  phone: string | null
}

interface ClientFormProps {
  client?: ExistingClient
  onSuccess?: (clientId: string) => void
  onCancel?: () => void
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState(client?.displayName ?? '')
  const [clientType, setClientType] = useState<'individual' | 'organization'>(
    client?.clientType ?? 'individual'
  )
  const [contactPerson, setContactPerson] = useState(client?.contactPerson ?? '')
  const [email, setEmail] = useState(client?.email ?? '')
  const [phone, setPhone] = useState(client?.phone ?? '')

  function handleSubmit() {
    setError(null)
    const data = { displayName, clientType, contactPerson, email, phone }

    startTransition(async () => {
      if (client) {
        const result = await updateClient(client.id, data)
        if (result.success) {
          showToast('Client updated')
          onSuccess?.(client.id)
        } else {
          setError(result.error ?? 'Failed to update client')
        }
      } else {
        const result = await createClient(data)
        if (result.success && result.client) {
          showToast('Client created')
          onSuccess?.(result.client.id)
        } else {
          setError(result.error ?? 'Failed to create client')
        }
      }
    })
  }

  return (
    <div className="space-y-4">
      <Field label="Client Type">
        <div className="flex gap-2">
          {(['individual', 'organization'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setClientType(type)}
              className="flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all capitalize"
              style={
                clientType === type
                  ? { background: 'rgba(198,164,108,0.15)', color: '#C6A46C', border: '1px solid rgba(198,164,108,0.3)' }
                  : { background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {type}
            </button>
          ))}
        </div>
      </Field>

      <Field label={clientType === 'organization' ? 'Organization Name' : 'Full Name'} error={error ?? undefined}>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={clientType === 'organization' ? 'e.g. Sunset Events Co.' : "e.g. Sarah Johnson"}
          autoFocus
        />
      </Field>

      {clientType === 'organization' && (
        <Field label="Contact Person">
          <Input
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="e.g. Sarah Johnson"
          />
        </Field>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@email.com"
          />
        </Field>
        <Field label="Phone">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 800 000 0000"
          />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="premium-ghost" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
        <Button
          type="button"
          variant="premium"
          onClick={handleSubmit}
          disabled={isPending || !displayName.trim()}
        >
          {isPending ? 'Saving...' : client ? 'Save Changes' : 'Create Client'}
        </Button>
      </div>
    </div>
  )
}