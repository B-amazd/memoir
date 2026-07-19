'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { ServiceCard } from './service-card'
import { reorderServices, createService } from '@/actions/service'
import { useToast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

interface Service {
  id: string
  title: string
  description: string | null
}

interface ServicesListProps {
  initialServices: Service[]
}

export function ServicesList({ initialServices }: ServicesListProps) {
  const [services, setServices] = useState(initialServices)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const { showToast } = useToast()
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = services.findIndex((s) => s.id === active.id)
    const newIndex = services.findIndex((s) => s.id === over.id)

    const reordered = arrayMove(services, oldIndex, newIndex)
    setServices(reordered)

    startTransition(async () => {
      const result = await reorderServices(reordered.map((s) => s.id))
      if (!result.success) {
        showToast('Failed to save order', 'error')
      }
    })
  }

  async function handleCreateNew(title: string, description: string) {
    const result = await createService({ title, description })
    if (result.success && result.service) {
      setServices((prev) => [...prev, result.service])
      setIsAddingNew(false)
      showToast('Service added')
    } else {
      showToast(result.error ?? 'Failed to add service', 'error')
    }
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </SortableContext>
      </DndContext>

      {isAddingNew ? (
        <NewServiceCard onSave={handleCreateNew} onCancel={() => setIsAddingNew(false)} />
      ) : (
        <Button
          type="button"
          variant="premium-outline"
          className="w-full"
          onClick={() => setIsAddingNew(true)}
        >
          + Add Service
        </Button>
      )}

      {services.length === 0 && !isAddingNew && (
        <GlassCard className="p-8 text-center">
          <p className="text-white/40 text-sm">No services yet. Add your first one above.</p>
        </GlassCard>
      )}
    </div>
  )
}

function NewServiceCard({
  onSave,
  onCancel,
}: {
  onSave: (title: string, description: string) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (!title.trim()) return
    startTransition(() => {
      onSave(title.trim(), description.trim())
    })
  }

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(198,164,108,0.3)',
        borderRadius: '14px',
      }}
      className="p-4 space-y-3"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Wedding Photography"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}
        className="w-full px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="Brief description of this service"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}
        className="w-full px-3 py-2.5 text-sm text-white outline-none resize-none placeholder:text-white/20"
      />
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="premium-ghost" size="sm" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="button" variant="premium" size="sm" onClick={handleSave} disabled={isPending || !title.trim()}>
          {isPending ? 'Adding...' : 'Add Service'}
        </Button>
      </div>
    </div>
  )
}