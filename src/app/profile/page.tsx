'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5DD62C]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <label className="block text-sm font-medium text-gray-600">Name</label>
              <p className="mt-1 text-lg text-gray-900">{user.name}</p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <label className="block text-sm font-medium text-gray-600">Role</label>
              <p className="mt-1 text-lg text-gray-900 capitalize">{user.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">User ID</label>
              <p className="mt-1 text-lg text-gray-900">{user.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 