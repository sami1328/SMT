'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface Trainee {
  name: string
  preferred_position: string
  birth_date: string
  test_result: {
    acceleration: number
    agility: number
    balance: number
    jumping: number
    reactions: number
    sprint_speed: number
    stamina: number
    strength: number
    aggression: number
    att_position: number
    composure: number
    interceptions: number
    vision: number
    ball_control: number
    crossing: number
    curve: number
    defensive_awareness: number
    dribbling: number
    fk_accuracy: number
    finishing: number
    heading_accuracy: number
    long_passing: number
    long_shots: number
    penalties: number
    short_passing: number
    shot_power: number
    sliding_tackle: number
    standing_tackle: number
    volleys: number
    gk_diving: number
    gk_handling: number
    gk_kicking: number
    gk_positioning: number
    gk_reflexes: number
  }
  position_results?: {
    st: number
    lw: number
    rw: number
    cam: number
    cm: number
    cdm: number
    lm: number
    rm: number
    lb: number
    rb: number
    cb: number
    gk: number
    best_position: string
    notes: string
  }
}

interface Application {
  id: string
  trainee_uid: string
  status: 'Pending' | 'Accepted' | 'Rejected'
  submitted_at: string
  feedback: string | null
  trainee: Trainee
}

export default function ApplicationDetails({ params }: { params: { cid: string; id: string } }) {
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    fetchApplication()
  }, [])

  const fetchApplication = async () => {
    try {
      const { data: applicationData, error: applicationError } = await supabase
        .from('club_applications')
        .select(`
          *,
          trainee:trainees(
            name,
            preferred_position,
            birth_date,
            test_result:test_results(*),
            position_results:position_results(*)
          )
        `)
        .eq('id', params.id)
        .single()

      if (applicationError) throw applicationError
      setApplication(applicationData)
    } catch (err) {
      console.error('Error fetching application:', err)
      setError('Failed to load application details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: 'Accepted' | 'Rejected') => {
    try {
      setIsSubmitting(true)
      const { error: updateError } = await supabase
        .from('club_applications')
        .update({
          status: newStatus,
          feedback: feedback || null
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      // Refresh application data
      fetchApplication()
      setFeedback('')
    } catch (err) {
      console.error('Error updating application status:', err)
      setError('Failed to update application status')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#000000] p-8">
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

  if (!application) {
    return (
      <div className="min-h-screen bg-white text-[#000000] p-8">
        <div className="max-w-7xl mx-auto">
          <p>Application not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#000000] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Trainee Profile</h1>
          <button
            onClick={() => router.push(`/dashboard/club/${params.cid}/applications`)}
            className="px-4 py-2 bg-[#F5F5F5] text-[#000000] rounded-lg hover:bg-[#E6E6E6] transition-colors"
          >
            Back to Applications
          </button>
        </div>

        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h2 className="text-xl font-semibold mb-4">Application Status</h2>
          <div className="flex items-center mb-4">
            <span className={`px-3 py-1 rounded-full text-sm ${
              application.status === 'Accepted' ? 'bg-[#14D922]/20 text-[#14D922]' :
              application.status === 'Rejected' ? 'bg-[#F44336]/20 text-[#F44336]' :
              'bg-[#FFC107]/20 text-[#FFC107]'
            }`}>
              {application.status}
            </span>
          </div>

          {application.status === 'Pending' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#555555] mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-[#F5F5F5] rounded-lg p-3 text-[#000000] border border-[#E6E6E6]"
                  rows={4}
                  placeholder="Enter your feedback here..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleStatusUpdate('Accepted')}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B31A] transition-colors disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleStatusUpdate('Rejected')}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#F44336] text-white rounded-lg hover:bg-[#D32F2F] transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {application.feedback && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-[#555555]">Feedback</h3>
              <p className="mt-1 text-[#000000]">{application.feedback}</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h2 className="text-xl font-semibold mb-4">Trainee Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-[#555555]">Name</h3>
              <p className="mt-1 text-[#000000]">{application.trainee.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#555555]">Preferred Position</h3>
              <p className="mt-1 text-[#000000]">{application.trainee.preferred_position}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#555555]">Birth Date</h3>
              <p className="mt-1 text-[#000000]">
                {new Date(application.trainee.birth_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {application.trainee.test_result && (
          <div className="mt-8 bg-white rounded-lg border border-[#E6E6E6] p-6">
            <h2 className="text-xl font-semibold mb-6">Test Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(application.trainee.test_result).map(([key, value]) => (
                <div key={key}>
                  <h3 className="text-sm font-medium text-[#555555] capitalize">
                    {key.replace(/_/g, ' ')}
                  </h3>
                  <div className="mt-2 relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-[#E6E6E6]">
                      <div
                        style={{ width: `${value}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#14D922]"
                      />
                    </div>
                    <span className="text-xs text-[#555555] mt-1">{value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {application.trainee.position_results && (
          <div className="mt-8 bg-white rounded-lg border border-[#E6E6E6] p-6">
            <h2 className="text-xl font-semibold mb-6">Position Analysis</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(application.trainee.position_results)
                .filter(([key]) => !['id', 'tid', 'best_position', 'notes', 'created_at', 'updated_at'].includes(key))
                .map(([key, value]) => (
                  <div key={key}>
                    <h3 className="text-sm font-medium text-[#555555] capitalize">
                      {key.toUpperCase()}
                    </h3>
                    <div className="mt-2 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-[#E6E6E6]">
                        <div
                          style={{ width: `${value}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#14D922]"
                        />
                      </div>
                      <span className="text-xs text-[#555555] mt-1">{value}%</span>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-[#555555] mb-2">Best Position</h3>
              <p className="text-[#000000] font-medium">{application.trainee.position_results.best_position}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-[#555555] mb-2">AI Analysis Notes</h3>
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p className="text-[#000000] whitespace-pre-wrap">{application.trainee.position_results.notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 