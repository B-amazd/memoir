'use client'

import { UserButton } from '@clerk/nextjs'

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-stone-200 bg-white px-6">
      <div />
      <UserButton />
    </header>
  )
}