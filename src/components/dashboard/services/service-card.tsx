'use client'

import { useState, useTransition } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { updateService, deleteService } from '@/actions/service'
import { useToast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/field'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface Service {
  id: string
  title: string
  description: string | null
}

interface ServiceCardProps {
  service: Service
  startInEditMode?: boolean
  onCancelNew?: () => void
}

export function ServiceCard({ service, startInEditMode, onCancelNew }: ServiceCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: service.id,
  })
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(!!startInEditMode)
  const [title, setTitle] = useState(service.title)
  const [description, setDescription] = useState(service.description ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateService(service.id, { title, description })
      if (result.success) {
        setIsEditing(false)
        showToast('Service saved')
      } else {
        setError(result.error ?? 'Failed to save')
      }
    })
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    function handleDelete() {
      startTransition(async () => {
        const result = await deleteService(service.id)
        if (result.success) {
          showToast('Service deleted')
        } else {
          showToast(result.error ?? 'Failed to delete', 'error')
        }
        setShowDeleteConfirm(false)
      })
    }

  function handleCancel() {
    if (onCancelNew) {
      onCancelNew()
      return
    }
    setTitle(service.title)
    setDescription(service.description ?? '')
    setIsEditing(false)
    setError(null)
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '14px',
      }}
      className="p-4"
    >
      {isEditing ? (
        <div className="space-y-3">
          <Field label="Title" error={error ?? undefined}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wedding Photography"
              autoFocus
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of this service"
            />
          </Field>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="premium-ghost" size="sm" onClick={handleCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" variant="premium" size="sm" onClick={handleSave} disabled={isPending || !title.trim()}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/50 transition-colors px-1 touch-none"
            aria-label="Drag to reorder"
          >
            ⠿
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{service.title}</p>
            {service.description && (
              <p className="text-xs text-white/40 mt-0.5">{service.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button type="button" variant="premium-ghost" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button type="button" variant="premium-danger" size="sm" onClick={() => setShowDeleteConfirm(true)} disabled={isPending}>
              Delete
            </Button>
            <ConfirmDialog
              open={showDeleteConfirm}
              title="Delete this service?"
              description={`"${service.title}" will be permanently removed from your portfolio.`}
              confirmLabel="Delete Service"
              isPending={isPending}
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}