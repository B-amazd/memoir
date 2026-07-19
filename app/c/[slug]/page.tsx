import { getPublicClientPage } from '@/actions/public-client-page'
import { ClientCarousel } from '@/components/public/client-carousel'
import { notFound } from 'next/navigation'

export default async function PublicClientPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await getPublicClientPage(slug)

  if (!page) notFound()

  return (
    <ClientCarousel
      slug={slug}
      clientName={page.client.displayName}
      businessName={page.client.portfolio.businessName}
      pageTitle={page.title}
      eventDate={page.eventDate}
      message={page.message}
      media={page.media}
      categories={page.mediaCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        media: cat.media,
      }))}
    />
  )
}