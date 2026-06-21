import { syncUser } from '@/lib/sync-user'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { ToastProvider } from '@/lib/toast'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await syncUser()
  if (!user) redirect('/sign-in')
  if (!user.portfolio) redirect('/onboarding')

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'linear-gradient(135deg, #1a0508 0%, #2e0d18 50%, #0d0306 100%)' }}
    >
      {/* Desktop sidebar */}
      <div className="hidden xl:block">
        <Sidebar fullName={user.fullName} email={user.email} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top nav */}
        <MobileNav fullName={user.fullName} email={user.email} />
        <main className="flex-1 p-4 xl:p-6">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  )
}