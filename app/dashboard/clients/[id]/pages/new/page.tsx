import { getClientById } from '@/actions/client'
import { ClientPageForm } from '@/components/dashboard/clients/client-page-form'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function NewClientPagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = await getClientById(id)

  if (!client) notFound()

  return (
    <div className="w-full py-4">
      <Link href={`/dashboard/clients/${id}`} className={cn(buttonVariants({ variant: 'premium-ghost' }))}>
        Back to {client.displayName}
      </Link>

      <div className="border-l-[3px] border-[#C6A46C] pl-4 mb-8 mt-3">
        <h1 className="text-3xl font-bold text-white">New Page</h1>
        <p className="text-sm text-white/40 mt-1">Create an event page for {client.displayName}.</p>
      </div>

      <ClientPageForm clientId={id} />
    </div>
  )
}