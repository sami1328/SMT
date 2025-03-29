'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

export default function TraineeAccess() {
  const [traineeId, setTraineeId] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(traineeId)) {
        setError('Invalid trainee ID format')
        setIsLoading(false)
        return
      }

      // Verify trainee exists
      const response = await fetch(`/api/trainees/${traineeId}/verify`)
      const result = await response.json()

      if (!response.ok) {
        console.error('Verification failed:', result.error)
        throw new Error(result.error || 'Failed to verify trainee')
      }

      if (!result.exists) {
        setError('Trainee not found')
        setIsLoading(false)
        return
      }

      // Redirect to trainee dashboard
      router.push(`/dashboard/trainee/${traineeId}`)
    } catch (err) {
      console.error('Detailed error:', err)
      setError(err instanceof Error ? err.message : 'Failed to verify trainee ID')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Trainee Access</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="traineeId" className="block text-gray-300 mb-2">
              Enter your Trainee ID
            </label>
            <input
              type="text"
              id="traineeId"
              value={traineeId}
              onChange={(e) => setTraineeId(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-[#5DD62C]"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </div>
          {error && (
            <div className="mb-4 text-red-400 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5DD62C] text-white py-2 px-4 rounded hover:bg-[#4BC31D] disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
} 