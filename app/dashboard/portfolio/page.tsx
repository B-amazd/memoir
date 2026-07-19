import { Suspense } from 'react'
import { syncUser } from '@/lib/sync-user'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PortfolioForm } from '@/components/dashboard/portfolio/portfolio-form'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

async function PortfolioContent() {
  const user = await syncUser()
  if (!user) redirect('/sign-in')

  const [portfolio, counts] = await Promise.all([
    prisma.portfolio.findUnique({ where: { userId: user.id } }),
    prisma.$queryRaw<{ projects: bigint; clients: bigint; reviews: bigint; services: bigint }[]>`
      SELECT
        (SELECT COUNT(*) FROM "Project" p JOIN "Portfolio" pf ON p."portfolioId" = pf.id WHERE pf."userId" = ${user.id}) as projects,
        (SELECT COUNT(*) FROM "Client" c JOIN "Portfolio" pf ON c."portfolioId" = pf.id WHERE pf."userId" = ${user.id}) as clients,
        (SELECT COUNT(*) FROM "Review" r JOIN "Portfolio" pf ON r."portfolioId" = pf.id WHERE pf."userId" = ${user.id}) as reviews,
        (SELECT COUNT(*) FROM "Service" s JOIN "Portfolio" pf ON s."portfolioId" = pf.id WHERE pf."userId" = ${user.id}) as services
    `,
  ])

  if (!portfolio) redirect('/onboarding')

  const stats = {
    projectCount: Number(counts[0]?.projects ?? 0),
    clientCount: Number(counts[0]?.clients ?? 0),
    reviewCount: Number(counts[0]?.reviews ?? 0),
    serviceCount: Number(counts[0]?.services ?? 0),
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: 'premium-ghost' }))}>
          Back to Overview
        </Link>

        <a
          href={`/p/${portfolio.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'premium-outline' }))}
        >
          👁 View Profile
        </a>
      </div>

      <div className="border-l-[3px] border-[#C6A46C] pl-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Portfolio Settings</h1>
        <p className="text-sm text-white/40 mt-1">
          Manage your public portfolio settings and information.
        </p>
      </div>

      <PortfolioForm portfolio={portfolio} stats={stats} />
    </>
  )
}

export default function PortfolioSettingsPage() {
  return (
    <div className="w-full py-4">
      <Suspense fallback={<DashboardSkeleton />}>
        <PortfolioContent />
      </Suspense>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col xl:grid xl:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-40 rounded-2xl animate-pulse"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
          />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-48 rounded-2xl animate-pulse"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
          />
        ))}
      </div>
    </div>
  )
}