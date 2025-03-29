'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5DD62C]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-[#0F0F0F] rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-[#F8F8F8] mb-6">Profile</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#F8F8F8]">Name</label>
              <p className="mt-1 text-lg text-[#F8F8F8]">{session?.user?.name || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F8F8F8]">Email</label>
              <p className="mt-1 text-lg text-[#F8F8F8]">{session?.user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F8F8F8]">User ID</label>
              <p className="mt-1 text-lg text-[#F8F8F8]">{session?.user?.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 