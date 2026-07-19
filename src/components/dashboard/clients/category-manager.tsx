'use client'

import { useState, useTransition } from 'react'
import { createMediaCategory, renameMediaCategory, deleteMediaCategory } from '@/actions/client-media-category'
import { useToast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { GlassCard, SectionHeader } from '@/components/ui/glass-card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface Category {
  id: string
  name: string
  _count: { media: number }
}

interface CategoryManagerProps {
  clientPageId: string
  initialCategories: Category[]
}

export function CategoryManager({ clientPageId, initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    if (!newName.trim()) return
    startTransition(async () => {
      const result = await createMediaCategory(clientPageId, newName.trim())
      if (result.success && result.category) {
        setCategories((prev) => {
          const exists = prev.find((c) => c.id === result.category!.id)
          return exists ? prev : [...prev, { ...result.category!, _count: { media: 0 } }]
        })
        setNewName('')
        setIsAdding(false)
        showToast('Category added')
      } else {
        showToast(result.error ?? 'Failed to add category', 'error')
      }
    })
  }

  function handleRename(id: string) {
    if (!editName.trim()) return
    startTransition(async () => {
      const result = await renameMediaCategory(id, editName.trim())
      if (result.success) {
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: editName.trim() } : c)))
        setEditingId(null)
        showToast('Category renamed')
      } else {
        showToast(result.error ?? 'Failed to rename', 'error')
      }
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteMediaCategory(deleteTarget.id)
      if (result.success) {
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id))
        showToast('Category deleted')
      } else {
        showToast(result.error ?? 'Failed to delete', 'error')
      }
      setDeleteTarget(null)
    })
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-1">
        <SectionHeader title="Photo Categories" />
      </div>
      <p className="text-[11px] text-white/30 -mt-2 mb-3">
        Optional. Categorized photos appear as separate galleries on the client's public page. Uncategorized photos stay internal only.
      </p>

      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {editingId === cat.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename(cat.id)}
                  className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(198,164,108,0.4)' }}
                />
                <Button size="sm" variant="premium" onClick={() => handleRename(cat.id)} disabled={isPending}>
                  Save
                </Button>
                <Button size="sm" variant="premium-ghost" onClick={() => setEditingId(null)} disabled={isPending}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium text-white">{cat.name}</p>
                  <p className="text-[10px] text-white/30">{cat._count.media} photo{cat._count.media !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="premium-ghost"
                    onClick={() => {
                      setEditingId(cat.id)
                      setEditName(cat.name)
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="premium-danger" onClick={() => setDeleteTarget(cat)}>
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}

        {categories.length === 0 && !isAdding && (
          <p className="text-xs text-white/30 py-2">No categories yet. Photos will stay uncategorized until you add one.</p>
        )}

        {isAdding ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Reception, Pre-event"
              className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none placeholder:text-white/20"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <Button size="sm" variant="premium" onClick={handleCreate} disabled={isPending || !newName.trim()}>
              Add
            </Button>
            <Button size="sm" variant="premium-ghost" onClick={() => { setIsAdding(false); setNewName('') }}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="premium-outline" size="sm" onClick={() => setIsAdding(true)} className="w-full">
            + Add Category
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this category?"
        description={`Photos in "${deleteTarget?.name}" will become uncategorized, not deleted. This cannot be undone.`}
        confirmLabel="Delete Category"
        isPending={isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </GlassCard>
  )
}