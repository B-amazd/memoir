import { getClientPageById } from '@/actions/client-page'
import { ClientPageForm } from '@/components/dashboard/clients/client-page-form'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditClientPagePage({
  params,
}: {
  params: Promise<{ id: string; pageId: string }>
}) {
  const { id, pageId } = await params
  const page = await getClientPageById(pageId)
  if (!page) notFound()

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/clients/${id}`} className={cn(buttonVariants({ variant: 'premium-ghost' }))}>
          Back to {page.client.displayName}
        </Link>
        <a
          href={`/c/${page.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'premium-outline' }))}
        >
          👁 View Client Page
        </a>
      </div>
      <div className="border-l-[3px] border-[#C6A46C] pl-4 mb-8 mt-3">
        <h1 className="text-3xl font-bold text-white">Edit Page</h1>
        <p className="text-sm text-white/40 mt-1">Update event page details.</p>
      </div>
      <ClientPageForm
        clientId={id}
        page={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          eventDate: page.eventDate,
          message: page.message,
          isPublished: page.isPublished,
          media: page.media,
          categories: page.mediaCategories,
          reviews: page.reviews,
        }}
      />
    </div>
  )
}