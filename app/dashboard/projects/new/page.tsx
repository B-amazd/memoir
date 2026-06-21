import { getCategories } from '@/actions/category'
import { ProjectForm } from '@/components/dashboard/projects/project-form'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function NewProjectPage() {
  const categories = await getCategories()

  return (
    <div className="w-full py-4">
      <Link href="/dashboard/projects" className={cn(buttonVariants({ variant: 'premium-ghost' }))}>
        Back to Projects
      </Link>

      <div className="border-l-[3px] border-[#C6A46C] pl-4 mb-8 mt-3">
        <h1 className="text-3xl font-bold text-white">New Project</h1>
        <p className="text-sm text-white/40 mt-1">Add a new project to your portfolio.</p>
      </div>
      <ProjectForm categories={categories} />
    </div>
  )
}