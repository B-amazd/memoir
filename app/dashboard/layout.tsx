import { syncUser } from '@/lib/sync-user'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'

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

  return (
    <div className="flex h-screen bg-[#F7F4EF]">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}