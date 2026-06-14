import { OnboardingForm } from '@/features/portfolio/components/OnboardingForm'

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-100 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">
            Welcome to Memoir
          </h1>
          <p className="mt-2 text-stone-500">
            Let's set up your portfolio. You can update these anytime.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  )
}