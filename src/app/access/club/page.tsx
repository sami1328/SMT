'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ClubAccess() {
  const [cid, setCid] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Verify club CID
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('cid, name')
        .eq('cid', cid)
        .single()

      if (clubError) {
        throw new Error('Invalid club ID')
      }

      if (!club) {
        throw new Error('Club not found')
      }

      // Store club info in session storage
      sessionStorage.setItem('clubInfo', JSON.stringify({
        cid: club.cid,
        name: club.name
      }))

      // Redirect to club dashboard
      router.push(`/dashboard/club/${club.cid}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error verifying club ID')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Club Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your Club ID to access the dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="cid" className="sr-only">
                Club ID
              </label>
              <input
                id="cid"
                name="cid"
                type="text"
                required
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-[#5DD62C] focus:border-[#5DD62C] focus:z-10 sm:text-sm"
                placeholder="Enter your Club ID"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#5DD62C] hover:bg-[#4BC425] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5DD62C] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 