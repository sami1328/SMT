'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) {
    return null // or redirect to login
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
} 