import { Suspense } from 'react'
import { getClients } from '@/actions/client'
import { ClientsListClient } from '@/components/dashboard/clients/clients-list-client'
import { SkeletonGrid } from '@/components/ui/skeleton-card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

async function ClientsContent() {
  const clients = await getClients()

  return (
    <>
      <Link href="/dashboard" className={cn(buttonVariants({ variant: 'premium-ghost' }))}>
        Back to Overview
      </Link>

      <div className="border-l-[3px] border-[#C6A46C] pl-4 mb-8 mt-3">
        <h1 className="text-3xl font-bold text-white">Clients</h1>
        <p className="text-sm text-white/40 mt-1">
          Manage your clients and their event pages.
        </p>
      </div>

      <ClientsListClient clients={clients} />
    </>
  )
}

export default function ClientsPage() {
  return (
    <div className="w-full py-4">
      <Suspense fallback={<SkeletonGrid count={3} height="h-24" />}>
        <ClientsContent />
      </Suspense>
    </div>
  )
}