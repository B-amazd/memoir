'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClientPage, updateClientPage, deleteClientPage } from '@/actions/client-page'
import { useToast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { GlassCard, SectionHeader } from '@/components/ui/glass-card'
import { Field, Input, Textarea } from '@/components/ui/field'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CategoryManager } from './category-manager'
import { ClientMediaGrid } from './client-media-grid'
import { ReviewModeration } from './review-moderation'

interface ExistingPage {
  id: string
  title: string
  slug: string
  eventDate: Date | null
  message: string | null
  isPublished: boolean
  media: { id: string; url: string; mediaType: string; categoryId: string | null }[]
  categories: { id: string; name: string; _count: { media: number } }[]
  reviews: {
    id: string
    reviewerName: string
    rating: number
    review: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: Date
  }[]
}

interface ClientPageFormProps {
  clientId: string
  page?: ExistingPage
}

export function ClientPageForm({ clientId, page }: ClientPageFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [title, setTitle] = useState(page?.title ?? '')
  const [slug, setSlug] = useState(page?.slug ?? '')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!page)
  const [eventDate, setEventDate] = useState(
    page?.eventDate ? new Date(page.eventDate).toISOString().split('T')[0] : ''
  )
  const [message, setMessage] = useState(page?.message ?? '')
  const [isPublished, setIsPublished] = useState(page?.isPublished ?? false)

  const isEditMode = !!page

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugManuallyEdited) {
      setSlug(slugify(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true)
    setSlug(slugify(value))
  }

  function handleSave() {
    setError(null)
    const data = { title, slug, eventDate, message, isPublished }

    startTransition(async () => {
      if (isEditMode) {
        const result = await updateClientPage(page.id, data)
        if (result.success) {
          showToast('Page updated')
        } else {
          setError(result.error ?? 'Failed to update page')
        }
      } else {
        const result = await createClientPage(clientId, data)
        if (result.success && result.page) {
          showToast('Page created')
          router.replace(`/dashboard/clients/${clientId}/pages/${result.page.id}/edit`)
        } else {
          setError(result.error ?? 'Failed to create page')
        }
      }
    })
  }

  function handleDelete() {
    if (!page) return
    startTransition(async () => {
      const result = await deleteClientPage(page.id)
      if (result.success) {
        showToast('Page deleted')
        router.push(`/dashboard/clients/${clientId}`)
      } else {
        showToast(result.error ?? 'Failed to delete page', 'error')
        setShowDeleteConfirm(false)
      }
    })
  }

  return (
    <div className="space-y-4 max-w-2xl">

      <GlassCard>
        <SectionHeader title="Page Details" />

        <Field label="Title" error={error ?? undefined}>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Sarah & David's Wedding Day"
          />
        </Field>

        <Field label="Slug" hint={`memoir.app/c/${slug || 'your-slug'}`}>
          <Input
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="sarah-david-wedding"
          />
        </Field>

        <Field label="Event Date">
          <Input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </Field>

        <Field label="Message to Client">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="A personal thank-you message that appears on their page"
          />
        </Field>

        <ToggleSwitch
          checked={isPublished}
          onChange={setIsPublished}
          label="Publish this page"
          description="Make it accessible to your client"
        />
      </GlassCard>

      {isEditMode && (
        <CategoryManager clientPageId={page.id} initialCategories={page.categories} />
      )}

      {isEditMode ? (
        <GlassCard>
          <SectionHeader title="Page Media" />
          <ClientMediaGrid
            clientPageId={page.id}
            initialMedia={page.media}
            categories={page.categories.map((c) => ({ id: c.id, name: c.name }))}
          />
        </GlassCard>
      ) : (
        <GlassCard>
          <SectionHeader title="Page Media" />
          <p className="text-xs text-white/30 mt-3">
            Save the page first to start adding photos and videos.
          </p>
        </GlassCard>
      )}

      {isEditMode && (
        <GlassCard>
          <SectionHeader title="Reviews" />
          <ReviewModeration reviews={page.reviews} />
        </GlassCard>
      )}

      <div className="flex items-center justify-between py-2 pb-10">
        <div />
        <div className="flex items-center gap-3">
          {isEditMode && (
            <>
              <Button
                type="button"
                variant="premium-danger"
                disabled={isPending}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
              <ConfirmDialog
                open={showDeleteConfirm}
                title="Delete this page?"
                description="This will permanently delete the page and all its media, categories, and reviews. This cannot be undone."
                confirmLabel="Delete Page"
                isPending={isPending}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
              />
            </>
          )}
          <Button
            type="button"
            variant="premium"
            size="xl"
            disabled={isPending || !title.trim() || !slug.trim()}
            onClick={handleSave}
          >
            {isPending ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Page'}
          </Button>
        </div>
      </div>

    </div>
  )
}