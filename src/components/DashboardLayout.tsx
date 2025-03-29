'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-16 bg-[#0F0F0F] min-h-screen fixed left-0 top-0">
          <div className="flex flex-col items-center py-4">
            <Link href="/dashboard" className="mb-8">
              <span className="text-2xl font-bold text-[#5DD62C]">SS</span>
            </Link>
            <nav className="w-full">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/dashboard"
                    className={`flex items-center justify-center p-2 text-[#F8F8F8] hover:text-[#5DD62C] transition-colors ${
                      isActive('/dashboard') ? 'text-[#5DD62C]' : ''
                    }`}
                    title="Dashboard"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/profile"
                    className={`flex items-center justify-center p-2 text-[#F8F8F8] hover:text-[#5DD62C] transition-colors ${
                      isActive('/dashboard/profile') ? 'text-[#5DD62C]' : ''
                    }`}
                    title="Profile"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/settings"
                    className={`flex items-center justify-center p-2 text-[#F8F8F8] hover:text-[#5DD62C] transition-colors ${
                      isActive('/dashboard/settings') ? 'text-[#5DD62C]' : ''
                    }`}
                    title="Settings"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-16">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
} 