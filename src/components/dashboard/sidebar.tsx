'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  Wrench,
  Users,
  Star,
  Settings,
  Shield,
} from 'lucide-react'
import { UserRole } from '@prisma/client'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const navItems = [
  { label: 'Overview',  href: '/dashboard',           icon: LayoutDashboard },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: Briefcase },
  { label: 'Projects',  href: '/dashboard/projects',  icon: FolderOpen },
  { label: 'Services',  href: '/dashboard/services',  icon: Wrench },
  { label: 'Clients',   href: '/dashboard/clients',   icon: Users },
  { label: 'Reviews',   href: '/dashboard/reviews',   icon: Star },
  { label: 'Settings',  href: '/dashboard/settings',  icon: Settings },
]

interface SidebarProps {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#111111]">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <span
          className="text-xl tracking-widest text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Memoir
        </span>
      </div>

      {/* Navigation */}
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
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
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

        {/* Admin section */}
        {role === UserRole.ADMIN && (
          <div className="mt-6 px-3">
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-white/30">
              Admin
            </p>
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-[#C6A46C]/20 text-[#C6A46C]'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              )}
            >
              <Shield className="h-4 w-4 shrink-0" />
              Admin Panel
            </Link>
          </div>
        )}
      </nav>
    </aside>
  )
}