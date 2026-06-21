'use client'

import { useState, useTransition } from 'react'
import { createCategory } from '@/actions/category'

interface Category {
  id: string
  name: string
}

interface CategorySelectProps {
  categories: Category[]
  value: string
  onChange: (categoryId: string) => void
}

const inputStyle = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
} as React.CSSProperties

export function CategorySelect({ categories, value, onChange }: CategorySelectProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [localCategories, setLocalCategories] = useState(categories)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleCreate() {
    if (!newCategoryName.trim()) return
    setError(null)

    startTransition(async () => {
      const result = await createCategory({ name: newCategoryName.trim() })
      if (result.success && result.category) {
        setLocalCategories((prev) => {
          const exists = prev.find((c) => c.id === result.category!.id)
          return exists ? prev : [...prev, result.category!]
        })
        onChange(result.category.id)
        setIsCreating(false)
        setNewCategoryName('')
      } else {
        setError(result.error ?? 'Failed to create category')
      }
    })
  }

  if (isCreating) {
    return (
      <div className="flex gap-2">
        <input
          autoFocus
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleCreate()
            }
            if (e.key === 'Escape') {
              setIsCreating(false)
              setNewCategoryName('')
            }
          }}
          placeholder="New category name"
          style={inputStyle}
          className="flex-1 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={isPending}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold text-[#080102] disabled:opacity-40"
          style={{ background: '#C6A46C' }}
        >
          {isPending ? '...' : 'Add'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsCreating(false)
            setNewCategoryName('')
          }}
          className="px-3 py-2.5 rounded-lg text-sm text-white/40"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
          className="flex-1 px-3 py-2.5 text-sm text-white outline-none appearance-none"
        >
          <option value="" style={{ background: '#1a0508' }}>
            No category
          </option>
          {localCategories.map((cat) => (
            <option key={cat.id} value={cat.id} style={{ background: '#1a0508' }}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#C6A46C] whitespace-nowrap"
          style={{ background: 'rgba(198,164,108,0.08)', border: '1px solid rgba(198,164,108,0.25)' }}
        >
          + New
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}