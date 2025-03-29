'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface Trainee {
  tid: string
  name: string
  birth_date: string
  preferred_position: string
  test_result?: {
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
}

interface Application {
  id: string
  trainee_uid: string
  status: 'Pending' | 'Accepted' | 'Rejected'
  submitted_at: string
  feedback: string | null
  trainee: Trainee
}

export default function ApplicationDetail({ params }: { params: { cid: string; id: string } }) {
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    fetchApplicationDetails()
  }, [params.id])

  const fetchApplicationDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('club_applications')
        .select(`
          *,
          trainee:trainees(
            *,
            test_results(*)
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error
      setApplication(data)
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
      setError(null)

      const { error: updateError } = await supabase
        .from('club_applications')
        .update({
          status: newStatus,
          feedback: feedback || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      // Refresh application details
      await fetchApplicationDetails()
      router.refresh()
    } catch (err) {
      console.error('Error updating application:', err)
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
          <div className="text-[#F44336]">Application not found</div>
        </div>
      </div>
    )
  }

  const trainee = application.trainee
  const testResult = trainee.test_result

  return (
    <div className="min-h-screen bg-white text-[#000000] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Application Details</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#F5F5F5] rounded-lg hover:bg-[#E6E6E6] transition-colors"
          >
            Back
          </button>
        </div>

        {/* Trainee Information */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Trainee Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[#555555]">Name</p>
              <p className="font-medium">{trainee.name}</p>
            </div>
            <div>
              <p className="text-[#555555]">Preferred Position</p>
              <p className="font-medium">{trainee.preferred_position}</p>
            </div>
            <div>
              <p className="text-[#555555]">Age</p>
              <p className="font-medium">
                {new Date().getFullYear() - new Date(trainee.birth_date).getFullYear()} years
              </p>
            </div>
            <div>
              <p className="text-[#555555]">Application Date</p>
              <p className="font-medium">
                {new Date(application.submitted_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Physical Attributes */}
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <h3 className="font-semibold mb-3">Physical Attributes</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Acceleration</span>
                    <span className={testResult.acceleration >= 80 ? 'text-[#14D922]' : testResult.acceleration >= 60 ? 'text-[#FFC107]' : 'text-[#F44336]'}>
                      {testResult.acceleration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Agility</span>
                    <span className={testResult.agility >= 80 ? 'text-[#14D922]' : testResult.agility >= 60 ? 'text-[#FFC107]' : 'text-[#F44336]'}>
                      {testResult.agility}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Balance</span>
                    <span className={testResult.balance >= 80 ? 'text-[#14D922]' : testResult.balance >= 60 ? 'text-[#FFC107]' : 'text-[#F44336]'}>
                      {testResult.balance}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Jumping</span>
                    <span className={testResult.jumping >= 80 ? 'text-[#14D922]' : testResult.jumping >= 60 ? 'text-[#FFC107]' : 'text-[#F44336]'}>
                      {testResult.jumping}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mental Attributes */}
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <h3 className="font-semibold mb-3">Mental Attributes</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Aggression</span>
                    <span className={testResult.aggression >= 80 ? 'text-[#14D922]' : testResult.aggression >= 60 ? 'text-[#FFC107]' : 'text-[#F44336]'}>
                      {testResult.aggression}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Composure</span>
                    <span className={testResult.composure >= 80 ? 'text-[#14D922]' : testResult.composure >= 60 ? 'text-[#FFC107]' : 'text-[#F44336]'}>
                      {testResult.composure}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Vision</span>
                    <span className={testResult.vision >= 80 ? 'text-[#14D922]' : testResult.vision >= 60 ? 'text-[#FFC107]' : 'text-[#F44336]'}>
                      {testResult.vision}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Attributes */}
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <h3 className="font-semibold mb-3">Technical Attributes</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Ball Control</span>
                    <span className={testResult.ball_control >= 80 ? 'text-[#14D922]' : testResult.ball_control >= 60 ? 'text-[#FFC107]' : 'text-[#F44336]'}>
                      {testResult.ball_control}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Dribbling</span>
                    <span className={testResult.dribbling >= 80 ? 'text-[#14D922]' : testResult.dribbling >= 60 ? 'text-[#FFC107]' : 'text-[#F44336]'}>
                      {testResult.dribbling}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Passing</span>
                    <span className={testResult.short_passing >= 80 ? 'text-[#14D922]' : testResult.short_passing >= 60 ? 'text-[#FFC107]' : 'text-[#F44336]'}>
                      {testResult.short_passing}
                    </span>
                  </div>
                </div>
              </div>

              {/* Goalkeeper Attributes */}
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <h3 className="font-semibold mb-3">Goalkeeper Attributes</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Diving</span>
                    <span className={testResult.gk_diving >= 80 ? 'text-[#14D922]' : testResult.gk_diving >= 60 ? 'text-[#FFC107]' : 'text-[#F44336]'}>
                      {testResult.gk_diving}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Handling</span>
                    <span className={testResult.gk_handling >= 80 ? 'text-[#14D922]' : testResult.gk_handling >= 60 ? 'text-[#FFC107]' : 'text-[#F44336]'}>
                      {testResult.gk_handling}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Reflexes</span>
                    <span className={testResult.gk_reflexes >= 80 ? 'text-[#14D922]' : testResult.gk_reflexes >= 60 ? 'text-[#FFC107]' : 'text-[#F44336]'}>
                      {testResult.gk_reflexes}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Status */}
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
                  Accept Application
                </button>
                <button
                  onClick={() => handleStatusUpdate('Rejected')}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#F44336] text-white rounded-lg hover:bg-[#D32F2F] transition-colors disabled:opacity-50"
                >
                  Reject Application
                </button>
              </div>
            </div>
          )}

          {application.feedback && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-[#555555] mb-2">Previous Feedback</h3>
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p className="text-[#555555]">{application.feedback}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-[#F44336]/20 text-[#F44336] rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 