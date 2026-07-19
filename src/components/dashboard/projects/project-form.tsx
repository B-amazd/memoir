'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { projectSchema, type ProjectFormData } from '@/lib/validations/project'
import { createProject, updateProject, deleteProject } from '@/actions/project'
import { CategorySelect } from './category-select'
import { ProjectMediaGrid } from './project-media-grid'
import { ProjectCoverUpload } from './project-cover-upload'
import { ProjectBannerUpload } from './project-banner-upload'
import { useToast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { GlassCard, SectionHeader } from '@/components/ui/glass-card'
import { Field, Input, Textarea } from '@/components/ui/field'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface Category {
  id: string
  name: string
}

interface ExistingProject {
  id: string
  title: string
  description: string | null
  categoryId: string | null
  isPublished: boolean
  coverImageUrl: string | null
  bannerImageUrl: string | null
  media: { id: string; url: string; mediaType: string }[]
}

interface ProjectFormProps {
  categories: Category[]
  project?: ExistingProject
}

export function ProjectForm({ categories, project }: ProjectFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(project?.id ?? null)
  const [projectMedia, setProjectMedia] = useState(project?.media ?? [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title ?? '',
      description: project?.description ?? '',
      categoryId: project?.categoryId ?? '',
      isPublished: project?.isPublished ?? false,
    },
  })

  const categoryId = watch('categoryId')
  const isPublished = watch('isPublished')
  const isEditMode = !!createdProjectId

  function onSubmit(data: ProjectFormData) {
    setErrorMsg(null)

    startTransition(async () => {
      if (isEditMode && createdProjectId) {
        const result = await updateProject(createdProjectId, data)
        if (result.success) {
          showToast('Project updated')
        } else {
          setErrorMsg(result.error ?? 'Something went wrong.')
        }
      } else {
        const result = await createProject(data)
        if (result.success && result.project) {
          setCreatedProjectId(result.project.id)
          showToast('Project created — you can now add media')
          router.replace(`/dashboard/projects/${result.project.id}/edit`)
        } else {
          setErrorMsg(result.error ?? 'Something went wrong.')
        }
      }
    })
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    function handleDelete() {
      if (!createdProjectId) return

      startTransition(async () => {
        const result = await deleteProject(createdProjectId)
        if (result.success) {
          showToast('Project deleted')
          router.push('/dashboard/projects')
        } else {
          setErrorMsg(result.error ?? 'Failed to delete project')
          setShowDeleteConfirm(false)
        }
      })
    }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">

      <GlassCard>
        <SectionHeader title="Project Details" />

        {isEditMode && (
          <div className="flex gap-4 items-start flex-wrap">
            <ProjectCoverUpload
              projectId={createdProjectId!}
              currentUrl={project?.coverImageUrl ?? null}
            />
            <ProjectBannerUpload
              projectId={createdProjectId!}
              currentUrl={project?.bannerImageUrl ?? null}
            />
          </div>
        )}

        <Field label="Title" error={errors.title?.message}>
          <Input {...register('title')} placeholder="e.g. Sarah & David's Wedding" />
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <Textarea {...register('description')} rows={3} placeholder="Brief description of this project" />
        </Field>

        <Field label="Category" error={errors.categoryId?.message}>
          <CategorySelect
            categories={categories}
            value={categoryId ?? ''}
            onChange={(id) => setValue('categoryId', id)}
          />
        </Field>

        <ToggleSwitch
          checked={isPublished}
          onChange={(val) => setValue('isPublished', val)}
          label="Publish this project"
          description="Make it visible on your public portfolio"
        />
      </GlassCard>

      {isEditMode ? (
        <GlassCard>
          <SectionHeader title="Project Media" />
          <ProjectMediaGrid projectId={createdProjectId!} initialMedia={projectMedia} />
        </GlassCard>
      ) : (
        <GlassCard>
          <SectionHeader title="Project Media" />
          <p className="text-xs text-white/30 mt-3">
            Save the project first to start adding photos and videos.
          </p>
        </GlassCard>
      )}

      <div className="flex items-center justify-between py-2 pb-10">
        <div>
          {errorMsg && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-300 bg-red-900/20 border border-red-400/20 rounded-full px-3 py-1.5">
              {errorMsg}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isEditMode && (
          <>
            <Button type="button" variant="premium-danger" disabled={isPending} onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </Button>
            <ConfirmDialog
              open={showDeleteConfirm}
              title="Delete this project?"
              description="This will permanently delete the project and all its media. This cannot be undone."
              confirmLabel="Delete Project"
              isPending={isPending}
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          </>
          )}
          <Button type="submit" variant="premium" size="xl" disabled={isPending}>
            {isPending ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </div>

    </form>
  )
}