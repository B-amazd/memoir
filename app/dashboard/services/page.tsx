import { Suspense } from 'react'
import { getServices } from '@/actions/service'
import { ServicesList } from '@/components/dashboard/services/services-list'
import { SkeletonGrid } from '@/components/ui/skeleton-card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

async function ServicesContent() {
  const services = await getServices()

  return (
    <>
      <Link href="/dashboard" className={cn(buttonVariants({ variant: 'premium-ghost' }))}>
        Back to Overview
      </Link>

      <div className="border-l-[3px] border-[#C6A46C] pl-4 mb-8 mt-3">
        <h1 className="text-3xl font-bold text-white">Services</h1>
        <p className="text-sm text-white/40 mt-1">
          Manage the services you offer. Drag to reorder how they appear on your portfolio.
        </p>
      </div>

      <div className="max-w-2xl">
        <ServicesList initialServices={services} />
      </div>
    </>
  )
}

export default function ServicesPage() {
  return (
    <div className="w-full py-4">
      <Suspense fallback={<SkeletonGrid count={3} height="h-20" />}>
        <ServicesContent />
      </Suspense>
    </div>
  )
}