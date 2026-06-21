import { getProjectById } from '@/actions/project'
import { getCategories } from '@/actions/category'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProjectForm } from '@/components/dashboard/projects/project-form'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, categories, user] = await Promise.all([
    getProjectById(id),
    getCategories(),
    getCurrentUser(),
  ])

  if (!project) notFound()

  const portfolio = user
    ? await prisma.portfolio.findUnique({ where: { userId: user.id }, select: { slug: true } })
    : null

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-4">
        <Link href="/dashboard/projects" className={cn(buttonVariants({ variant: 'premium-ghost' }))}>
          Back to Projects
        </Link>

        {portfolio?.slug && (
          <Link
            href={`/p/${portfolio.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'premium-outline' }))}
          >
            👁 View Profile
          </Link>
        )}
      </div>

      <div className="border-l-[3px] border-[#C6A46C] pl-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Project</h1>
        <p className="text-sm text-white/40 mt-1">Update your project details and media.</p>
      </div>
      <ProjectForm categories={categories} project={project} />
    </div>
  )
}