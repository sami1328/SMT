'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface Trainee {
  name: string
  birth_date: string
  preferred_position: string
  status: string
}

interface Application {
  id: string
  club_id: string
  status: 'Pending' | 'Accepted' | 'Rejected'
  submitted_at: string
  feedback: string | null
  club: {
    name: string
    location: string
  }
}

export default function TraineeDashboard() {
  const [trainee, setTrainee] = useState<Trainee | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    fetchTraineeData()
    fetchApplications()
  }, [])

  const fetchTraineeData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data: traineeData, error: traineeError } = await supabase
        .from('trainees')
        .select('*')
        .eq('uid', user.id)
        .single()

      if (traineeError) throw traineeError
      setTrainee(traineeData)
    } catch (err) {
      console.error('Error fetching trainee data:', err)
      setError('Failed to load trainee data')
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data: applicationsData, error: applicationsError } = await supabase
        .from('club_applications')
        .select(`
          *,
          club:clubs(name, location)
        `)
        .eq('trainee_uid', user.id)
        .order('submitted_at', { ascending: false })

      if (applicationsError) throw applicationsError
      setApplications(applicationsData || [])
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError('Failed to load applications')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-[#F5F5F5] rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-[#F5F5F5] rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Trainee Dashboard</h1>

        {/* Status Card */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-[#E6E6E6]">
          <h2 className="text-xl font-semibold text-black mb-4">Your Status</h2>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm ${
              trainee?.status === 'Test Completed' ? 'bg-[#14D922]/20 text-[#14D922]' :
              trainee?.status === 'Pending Test' ? 'bg-yellow-500/20 text-yellow-600' :
              'bg-gray-500/20 text-[#555555]'
            }`}>
              {trainee?.status || 'Not Set'}
            </span>
            {trainee?.status === 'Pending Test' && (
              <button
                onClick={() => router.push('/dashboard/trainee/test')}
                className="px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B61E] transition-colors"
              >
                Take Test
              </button>
            )}
          </div>
        </div>

        {/* Applications Section */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-[#E6E6E6]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black">Your Applications</h2>
            {trainee?.status === 'Test Completed' && (
              <button
                onClick={() => router.push('/dashboard/trainee/clubs')}
                className="px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B61E] transition-colors"
              >
                Apply to Clubs
              </button>
            )}
          </div>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg p-4 border border-[#E6E6E6]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-black">{application.club.name}</h3>
                      <p className="text-[#555555]">{application.club.location}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      application.status === 'Accepted' ? 'bg-[#14D922]/20 text-[#14D922]' :
                      application.status === 'Rejected' ? 'bg-red-500/20 text-red-600' :
                      'bg-yellow-500/20 text-yellow-600'
                    }`}>
                      {application.status}
                    </span>
                  </div>
                  {application.feedback && (
                    <div className="mt-2 p-3 bg-[#F5F5F5] rounded-lg">
                      <p className="text-sm text-[#555555]">{application.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#555555]">No applications yet.</p>
          )}
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
          <h2 className="text-xl font-semibold text-black mb-4">Your Profile</h2>
          <div className="space-y-2">
            <p><span className="text-[#555555]">Name:</span> <span className="text-black">{trainee?.name}</span></p>
            <p><span className="text-[#555555]">Age:</span> <span className="text-black">{trainee ? new Date().getFullYear() - new Date(trainee.birth_date).getFullYear() : 'N/A'}</span></p>
            <p><span className="text-[#555555]">Preferred Position:</span> <span className="text-black">{trainee?.preferred_position}</span></p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 