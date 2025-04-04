'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { getCurrentUser } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface User {
  email: string
  full_name: string
  role: string
}

export default function ClubDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user: userData } = await getCurrentUser()
        if (userData) {
          setUser({
            email: userData.email || '',
            full_name: userData.user_metadata?.full_name || '',
            role: userData.user_metadata?.role || ''
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <DashboardLayout role="club">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14D922]"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="club">
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#000000] mb-2">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-[#555555] text-sm sm:text-base">
            Manage your talent pool and scout network from your club dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-[#000000] mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-[#555555]">Players in Talent Pool</p>
                <p className="text-xl sm:text-2xl font-bold text-[#14D922]">0</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#555555]">Active Scouts</p>
                <p className="text-xl sm:text-2xl font-bold text-[#14D922]">0</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#555555]">New Reports This Month</p>
                <p className="text-xl sm:text-2xl font-bold text-[#14D922]">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-[#000000] mb-4">Top Prospects</h2>
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-[#555555]">No prospects in talent pool yet</p>
              <Link 
                href="/dashboard/club/talent-pool"
                className="inline-block w-full sm:w-auto text-center px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B61E] transition-colors text-sm sm:text-base"
              >
                View Talent Pool
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-[#000000] mb-4">Scout Network</h2>
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-[#555555]">No scouts assigned yet</p>
              <Link 
                href="/dashboard/club/scouts"
                className="inline-block w-full sm:w-auto text-center px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B61E] transition-colors text-sm sm:text-base"
              >
                Manage Scouts
              </Link>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#000000] mb-4">Review New Players</h2>
            <p className="mb-6 text-sm sm:text-base text-[#555555]">
              Review recently scouted players and add promising talents to your talent pool.
            </p>
            <Link 
              href="/dashboard/club/talent-pool/review"
              className="inline-block w-full sm:w-auto text-center px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B61E] transition-colors text-sm sm:text-base"
            >
              Review Players
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#000000] mb-4">Assign Scouts</h2>
            <p className="mb-6 text-sm sm:text-base text-[#555555]">
              Assign scouts to specific regions or competitions to expand your talent network.
            </p>
            <Link 
              href="/dashboard/club/scouts/assign"
              className="inline-block w-full sm:w-auto text-center px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B61E] transition-colors text-sm sm:text-base"
            >
              Assign Scouts
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 