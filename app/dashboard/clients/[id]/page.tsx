import { Suspense } from 'react'
import { getClientById } from '@/actions/client'
import { ClientDetailContent } from '@/components/dashboard/clients/client-detail-content'
import { SkeletonGrid } from '@/components/ui/skeleton-card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function ClientDetailWrapper({ id }: { id: string }) {
  const client = await getClientById(id)
  if (!client) notFound()

  return (
    <>
      <Link href="/dashboard/clients" className={cn(buttonVariants({ variant: 'premium-ghost' }))}>
        Back to Clients
      </Link>

      <div className="border-l-[3px] border-[#C6A46C] pl-4 mb-8 mt-3">
        <h1 className="text-3xl font-bold text-white">{client.displayName}</h1>
        <p className="text-sm text-white/40 mt-1">Manage client info and event pages.</p>
      </div>

      <ClientDetailContent client={client} />
    </>
  )
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="w-full py-4">
      <Suspense fallback={<SkeletonGrid count={3} height="h-32" />}>
        <ClientDetailWrapper id={id} />
      </Suspense>
    </div>
  )
}