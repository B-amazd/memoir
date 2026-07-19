import { Suspense } from 'react'
import { getProjects } from '@/actions/project'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/glass-card'
import { SkeletonGrid } from '@/components/ui/skeleton-card'

async function ProjectsContent() {
  const [projects, user] = await Promise.all([getProjects(), getCurrentUser()])

  const portfolio = user
    ? await prisma.portfolio.findUnique({ where: { userId: user.id }, select: { slug: true } })
    : null

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="border-l-[3px] border-[#C6A46C] pl-4">
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-sm text-white/40 mt-1">
            Manage your portfolio projects and galleries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {portfolio?.slug && (
            <Link
              href={`/p/${portfolio.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'premium-outline' }), 'flex-1 sm:flex-initial')}
            >
              👁 View Profile
            </Link>
          )}
          <Link
            href="/dashboard/projects/new"
            className={cn(buttonVariants({ variant: 'premium' }), 'flex-1 sm:flex-initial whitespace-nowrap')}
          >
            + New Project
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-white/40 text-sm mb-4">No projects yet.</p>
          <Link
            href="/dashboard/projects/new"
            className={cn(buttonVariants({ variant: 'premium' }))}
          >
            Create your first project
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}/edit`}
              className="overflow-hidden rounded-2xl group hover:-translate-y-1 hover:border-[#C6A46C]/25 active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A46C]/40"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: '0 4px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <div className="p-4 flex items-center gap-3 border-b border-white/[0.06]">
                <div
                  className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: project.coverImageUrl
                      ? `url(${project.coverImageUrl}) center/cover`
                      : 'linear-gradient(135deg, rgba(107,49,64,0.6), rgba(8,2,5,0.9))',
                  }}
                >
                  {!project.coverImageUrl && (
                    <span className="text-[10px] text-white/20">{project.title.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{project.title}</h3>
                  {project.category && (
                    <span className="text-[10px] text-white/30">{project.category.name}</span>
                  )}
                </div>
                <span
                  className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                  style={
                    project.isPublished
                      ? { background: 'rgba(198,164,108,0.15)', color: '#C6A46C' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }
                  }
                >
                  {project.isPublished ? 'Live' : 'Draft'}
                </span>
              </div>

              <div
                className="h-56 relative flex items-center justify-center overflow-hidden"
                style={{
                  background: project.bannerImageUrl
                    ? `url(${project.bannerImageUrl}) center/cover`
                    : 'linear-gradient(135deg, rgba(107,49,64,0.4), rgba(8,2,5,0.8))',
                }}
              >
                {!project.bannerImageUrl && (
                  <span className="text-xs text-white/20 italic relative z-10">No cover image yet</span>
                )}
              </div>

              <div className="p-3 flex items-center justify-between">
                <span className="text-[10px] text-white/25">{project._count.media} media files</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

export default function ProjectsPage() {
  return (
    <div className="w-full py-4">
      <Suspense fallback={<SkeletonGrid count={3} height="h-72" />}>
        <ProjectsContent />
      </Suspense>
    </div>
  )
}