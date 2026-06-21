'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { portfolioSchema, type PortfolioFormData } from '@/lib/validations/portfolio'
import { updatePortfolio } from '@/actions/portfolio'
import { PortfolioSidepanel } from './portfolio-sidepanel'
import type { Portfolio } from '@prisma/client'
import { ImageUpload } from './image-upload'
import { Button } from '@/components/ui/button'

const inputClass =
  'w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:ring-2 focus:ring-[#C6A46C]/20'

const inputStyle = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
} as React.CSSProperties

const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '16px',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  boxShadow: '0 4px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
} as React.CSSProperties

interface PortfolioFormProps {
  portfolio: Portfolio
  stats: {
    projectCount: number
    clientCount: number
    reviewCount: number
    serviceCount: number
  }
}

export function PortfolioForm({ portfolio, stats }: PortfolioFormProps) {
  const [isPending, startTransition] = useTransition()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const { register, handleSubmit, control, formState: { errors, isDirty } } =
    useForm<PortfolioFormData>({
      resolver: zodResolver(portfolioSchema),
      defaultValues: {
        businessName: portfolio.businessName ?? '',
        slug: portfolio.slug ?? '',
        description: portfolio.description ?? '',
        heroTitle: portfolio.heroTitle ?? '',
        heroSubtitle: portfolio.heroSubtitle ?? '',
        phone: portfolio.phone ?? '',
        email: portfolio.email ?? '',
        instagram: portfolio.instagram ?? '',
        facebook: portfolio.facebook ?? '',
        linkedin: portfolio.linkedin ?? '',
        website: portfolio.website ?? '',
      },
    })

  const liveValues = useWatch({ control })

  function onSubmit(data: PortfolioFormData) {
    setSuccessMsg(null)
    setErrorMsg(null)
    startTransition(async () => {
      const result = await updatePortfolio(data)
      if (result.success) {
        setSuccessMsg('Portfolio updated successfully.')
      } else {
        setErrorMsg(result.error ?? 'Something went wrong.')
      }
    })
  }

  const sidepanelValues = {
    businessName: liveValues.businessName ?? '',
    slug: liveValues.slug ?? '',
    description: liveValues.description ?? '',
    heroTitle: liveValues.heroTitle ?? '',
    heroSubtitle: liveValues.heroSubtitle ?? '',
    phone: liveValues.phone ?? '',
    email: liveValues.email ?? '',
    instagram: liveValues.instagram ?? '',
    facebook: liveValues.facebook ?? '',
    website: liveValues.website ?? '',
  }

  return (
    <div className="flex flex-col xl:grid xl:grid-cols-[1fr_320px] gap-6 items-start">

      {/* Sidepanel — top on mobile, right column on desktop */}
      <div className="order-first xl:order-last xl:col-start-2 xl:row-start-1">
        {/* Mobile toggle */}
        <div className="xl:hidden flex justify-end mb-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#C6A46C]"
            style={{ background: 'rgba(198,164,108,0.08)', border: '1px solid rgba(198,164,108,0.25)' }}
          >
            {showPreview ? 'Hide Preview' : 'View Preview'}
          </button>
        </div>
        <div className={`xl:block ${showPreview ? 'block' : 'hidden'}`}>
          <PortfolioSidepanel
            portfolio={portfolio}
            liveValues={sidepanelValues}
            stats={stats}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full xl:col-start-1 xl:row-start-1">

        <div style={cardStyle} className="p-6 space-y-4">
          <SectionHeader title="Basic Information" />
          <ImageUpload
          target="logo"
          currentUrl={portfolio.logoUrl}
          label="Business Logo"
          aspectHint="Square, recommended 400×400px"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Business Name" error={errors.businessName?.message}>
              <input
                {...register('businessName')}
                style={inputStyle}
                className={inputClass}
                placeholder="Your studio name"
              />
            </Field>
            <Field label="Slug" error={errors.slug?.message} hint={`memoir.app/${liveValues.slug || portfolio.slug}`}>
              <input
                {...register('slug')}
                style={inputStyle}
                className={inputClass}
                placeholder="your-studio"
              />
            </Field>
          </div>
          <Field label="Description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              rows={3}
              style={inputStyle}
              className={inputClass + ' resize-none'}
              placeholder="A short bio or description of your work"
            />
          </Field>
        </div>

        <div style={cardStyle} className="p-6 space-y-4">
          <SectionHeader title="Hero Content" />
          <ImageUpload
          target="hero"
          currentUrl={portfolio.heroImageUrl}
          label="Hero Image"
          aspectHint="Wide banner, recommended 1600×900px"
          />
          <Field label="Hero Title" error={errors.heroTitle?.message}>
            <input
              {...register('heroTitle')}
              style={inputStyle}
              className={inputClass}
              placeholder="Capturing moments that last forever"
            />
          </Field>
          <Field label="Hero Subtitle" error={errors.heroSubtitle?.message}>
            <input
              {...register('heroSubtitle')}
              style={inputStyle}
              className={inputClass}
              placeholder="Wedding & portrait photographer based in Lagos"
            />
          </Field>
        </div>

        <div style={cardStyle} className="p-6 space-y-4">
          <SectionHeader title="Contact Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Phone" error={errors.phone?.message}>
              <input
                {...register('phone')}
                style={inputStyle}
                className={inputClass}
                placeholder="+234 800 000 0000"
              />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input
                {...register('email')}
                type="email"
                style={inputStyle}
                className={inputClass}
                placeholder="hello@yourstudio.com"
              />
            </Field>
          </div>
        </div>

        <div style={cardStyle} className="p-6 space-y-4">
          <SectionHeader title="Social & Website" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Instagram" error={errors.instagram?.message}>
              <input
                {...register('instagram')}
                style={inputStyle}
                className={inputClass}
                placeholder="@yourstudio"
              />
            </Field>
            <Field label="Facebook" error={errors.facebook?.message}>
              <input
                {...register('facebook')}
                style={inputStyle}
                className={inputClass}
                placeholder="facebook.com/yourstudio"
              />
            </Field>
            <Field label="LinkedIn" error={errors.linkedin?.message}>
              <input
                {...register('linkedin')}
                style={inputStyle}
                className={inputClass}
                placeholder="linkedin.com/in/yourname"
              />
            </Field>
            <Field label="Website" error={errors.website?.message}>
              <input
                {...register('website')}
                style={inputStyle}
                className={inputClass}
                placeholder="https://yourstudio.com"
              />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 pb-10">
          <div>
            {successMsg && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C6A46C] bg-[#C6A46C]/10 border border-[#C6A46C]/20 rounded-full px-3 py-1.5">
                ✓ {successMsg}
              </span>
            )}
            {errorMsg && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-300 bg-red-900/20 border border-red-400/20 rounded-full px-3 py-1.5">
                {errorMsg}
              </span>
            )}
          </div>
          <Button type="submit" variant="premium" size="xl" disabled={isPending || !isDirty}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

      </form>

    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
      <div className="w-2 h-2 rounded-full bg-[#C6A46C]" style={{ boxShadow: '0 0 8px rgba(198,164,108,0.9)' }} />
      <h2 className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#C6A46C]">{title}</h2>
    </div>
  )
}

function Field({ label, error, hint, children }: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-[0.1em]">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[#C6A46C]">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}