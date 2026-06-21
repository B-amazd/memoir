'use client'

import { useState } from 'react'
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
  Menu,
  X,
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

interface MobileNavProps {
  fullName: string | null
  email: string
}

export function MobileNav({ fullName, email }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Top bar */}
      <div
        className="xl:hidden flex items-center justify-between px-4 h-14 border-b border-white/10"
        style={{ background: '#3D1A24' }}
      >
        <span
          className="text-lg tracking-widest text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Memoir
        </span>
        <div className="flex items-center gap-3">
          <UserButton />
          <button
            onClick={() => setOpen(true)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="xl:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`xl:hidden fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#3D1A24' }}
      >
        <div className="flex items-center justify-between px-6 h-14 border-b border-white/10">
          <span
            className="text-lg tracking-widest text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Memoir
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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
                    onClick={() => setOpen(false)}
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
        </nav>

        <div
          className="flex items-center gap-3 px-4 py-4 border-t border-white/10"
          style={{ background: 'rgba(0,0,0,0.2)' }}
        >
          <UserButton />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">
              {fullName ?? 'Your Name'}
            </span>
            <span className="text-xs text-white/40 truncate">{email}</span>
          </div>
        </div>
      </div>
    </>
  )
}