import { syncUser } from '@/lib/sync-user'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await syncUser()

  if (!user) {
    redirect('/sign-in')
  }

  if (!user.portfolio) {
    redirect('/onboarding')
  }

  return <>{children}</>
}