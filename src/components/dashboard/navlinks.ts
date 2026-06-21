import {
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Wrench,
  Users,
  Star,
  Image,
  Settings,
} from 'lucide-react'

export const dashboardLinks = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Portfolio',
    href: '/dashboard/portfolio',
    icon: Briefcase,
  },
  {
    title: 'Projects',
    href: '/dashboard/projects',
    icon: FolderKanban,
  },
  {
    title: 'Services',
    href: '/dashboard/services',
    icon: Wrench,
  },
  {
    title: 'Clients',
    href: '/dashboard/clients',
    icon: Users,
  },
  {
    title: 'Reviews',
    href: '/dashboard/reviews',
    icon: Star,
  },
  {
    title: 'Media',
    href: '/dashboard/media',
    icon: Image,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]