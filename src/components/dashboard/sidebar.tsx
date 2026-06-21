'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  Wrench,
  Users,
  Star,
  Settings,
  ImageIcon,
} from 'lucide-react'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: Briefcase },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
  { label: 'Services', href: '/dashboard/services', icon: Wrench },
  { label: 'Clients', href: '/dashboard/clients', icon: Users },
  { label: 'Reviews', href: '/dashboard/reviews', icon: Star },
  { label: 'Media', href: '/dashboard/media', icon: ImageIcon },
  { label: 'Account', href: '/dashboard/account', icon: Settings },
]

interface SidebarProps {
  fullName: string | null
  email: string
}

export function Sidebar({ fullName, email }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col bg-[#3D1A24]">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link
          href="/dashboard"
          className="text-xl tracking-widest text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Memoir
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A46C]/40',
                    isActive
                      ? 'bg-[#C6A46C]/20 text-[#C6A46C]'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-white/10 p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{fullName}</p>
            <p className="text-xs text-white/60">{email}</p>
          </div>
          <UserButton />
        </div>
      </div>
    </aside>
  )
}