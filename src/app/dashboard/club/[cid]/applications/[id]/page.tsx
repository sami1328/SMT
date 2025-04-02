'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'

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
            test_result:test_results(*)
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

  const handleDownloadReport = async () => {
    try {
      // Get the pitch visualization element
      const pitchElement = document.getElementById('pitch-visualization')
      if (!pitchElement) return

      // Convert pitch visualization to base64
      const canvas = await html2canvas(pitchElement)
      const pitchImage = canvas.toDataURL('image/png')

      // Prepare trainee data
      const traineeData = {
        name: application?.trainee.name,
        preferred_position: application?.trainee.preferred_position,
        test_result: application?.trainee.test_result
      }

      // Generate PDF report
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traineeData,
          pitchImage
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      // Create blob from response and trigger download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trainee-report-${application?.trainee.name}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading report:', error)
      setError('Failed to download report')
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
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/dashboard/club/${params.cid}/applications`)}
              className="px-4 py-2 bg-[#F5F5F5] text-[#000000] rounded-lg hover:bg-[#E6E6E6] transition-colors"
            >
              Back to Applications
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B31A] transition-colors"
            >
              Download Report
            </button>
          </div>
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