'use client'

import { useState, useTransition } from 'react'
import { updateReviewStatus, deleteReview } from '@/actions/review'
import { useToast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface Review {
  id: string
  reviewerName: string
  rating: number
  review: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
}

interface ReviewModerationProps {
  reviews: Review[]
}

export function ReviewModeration({ reviews: initialReviews }: ReviewModerationProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  function handleStatusChange(reviewId: string, status: 'approved' | 'rejected') {
    startTransition(async () => {
      const result = await updateReviewStatus(reviewId, status)
      if (result.success) {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status } : r)))
        showToast(status === 'approved' ? 'Review approved' : 'Review rejected')
      } else {
        showToast(result.error ?? 'Failed to update review', 'error')
      }
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteReview(deleteTarget)
      if (result.success) {
        setReviews((prev) => prev.filter((r) => r.id !== deleteTarget))
        showToast('Review deleted')
      } else {
        showToast(result.error ?? 'Failed to delete review', 'error')
      }
      setDeleteTarget(null)
    })
  }

  if (reviews.length === 0) {
    return <p className="text-xs text-white/30 pt-2">No reviews yet for this page.</p>
  }

  return (
    <div className="space-y-3 pt-2">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="p-4 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{review.reviewerName}</p>
              <div className="flex items-center gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < review.rating ? 'text-[#C6A46C]' : 'text-white/15'}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            <StatusBadge status={review.status} />
          </div>

          <p className="text-sm text-white/60 leading-relaxed mb-3">{review.review}</p>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/25">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-2">
              {review.status !== 'approved' && (
                <Button
                  type="button"
                  variant="premium-outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleStatusChange(review.id, 'approved')}
                >
                  Approve
                </Button>
              )}
              {review.status !== 'rejected' && (
                <Button
                  type="button"
                  variant="premium-ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleStatusChange(review.id, 'rejected')}
                >
                  Reject
                </Button>
              )}
              <Button
                type="button"
                variant="premium-danger"
                size="sm"
                disabled={isPending}
                onClick={() => setDeleteTarget(review.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this review?"
        description="This will permanently remove the review. This cannot be undone."
        confirmLabel="Delete Review"
        isPending={isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const config = {
    pending: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', label: 'Pending' },
    approved: { bg: 'rgba(198,164,108,0.15)', color: '#C6A46C', label: 'Approved' },
    rejected: { bg: 'rgba(220,38,38,0.12)', color: '#f87171', label: 'Rejected' },
  }[status]

  return (
    <span
      className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  )
}