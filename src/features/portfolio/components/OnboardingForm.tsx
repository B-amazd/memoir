'use client'

import { useState, useTransition } from 'react'
import { createPortfolio } from '@/features/portfolio/actions/createPortfolio'
import { generateSlug } from '@/utils/slug'

export function OnboardingForm() {
  const [businessName, setBusinessName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleBusinessNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setBusinessName(value)
    if (!slugEdited) {
      setSlug(generateSlug(value))
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true)
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
    setSlug(value)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await createPortfolio({ businessName, slug })
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="businessName"
          className="text-sm font-medium text-stone-700"
        >
          Business Name
        </label>
        <input
          id="businessName"
          type="text"
          value={businessName}
          onChange={handleBusinessNameChange}
          placeholder="e.g. Memoir Events"
          required
          className="h-11 rounded-xl border border-stone-200 bg-white px-4 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="slug"
          className="text-sm font-medium text-stone-700"
        >
          Portfolio URL
        </label>
        <div className="flex h-11 items-center rounded-xl border border-stone-200 bg-white px-4 focus-within:ring-2 focus-within:ring-amber-500">
          <span className="shrink-0 text-sm text-stone-400">memoir.app/</span>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={handleSlugChange}
            placeholder="your-business"
            required
            className="flex-1 bg-transparent text-sm text-stone-900 focus:outline-none"
          />
        </div>
        {slug && (
          <p className="text-xs text-stone-500">
            Your portfolio will be at:{' '}
            <span className="font-medium text-stone-700">memoir.app/{slug}</span>
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending || !businessName || !slug}
        className="h-11 rounded-xl bg-amber-600 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Creating your portfolio...' : 'Create Portfolio'}
      </button>
    </form>
  )
}