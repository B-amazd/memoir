import { syncUser } from '@/lib/sync-user'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await syncUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Already has a portfolio — skip onboarding
  if (user.portfolio) {
    redirect('/dashboard')
  }

  return <>{children}</>
}