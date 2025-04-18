'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'
import type { Trainee, TestResult } from '@/types/database'

interface TraineeDetailsClientProps {
  tid: string;
}

export default function TraineeDetailsClient({ tid }: TraineeDetailsClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [trainee, setTrainee] = useState<Trainee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState<TestResult>({
    id: '',
    tid: '',
    submitted_by: '',
    test_date: new Date().toISOString(),
    technical_skills: 50,
    tactical_understanding: 50,
    physical_abilities: 50,
    mental_attributes: 50,
    overall_rating: 50,
    notes: ''
  })

  const calculateAge = (birthDate: string): number => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  useEffect(() => {
    const fetchTraineeDetails = async () => {
      try {
        const response = await fetch(`/api/trainees/${tid}`)
        if (!response.ok) throw new Error('Failed to fetch trainee details')
        const data = await response.json()
        setTrainee(data)
        setFormData(prev => ({ ...prev, tid: data.tid }))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTraineeDetails()
  }, [tid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClientComponentClient<Database>()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const testResult: TestResult = {
        ...formData,
        tid,
        submitted_by: user.id,
      }

      const { error: insertError } = await supabase
        .from('test_results')
        .insert([testResult])

      if (insertError) {
        throw new Error(insertError.message)
      }

      setSuccessMessage('Test results submitted successfully!')
      router.push('/dashboard/scouter')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#14D922]"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-[#F44336] text-center py-4 bg-white">{error}</div>
      </DashboardLayout>
    )
  }

  if (!trainee) {
    return (
      <DashboardLayout>
        <div className="text-[#555555] text-center py-4 bg-white">Trainee not found</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-4 lg:p-6 mb-4 lg:mb-6 border border-[#E6E6E6]">
            <h1 className="text-xl lg:text-2xl font-bold text-black mb-4">{trainee.name}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#555555]">
              <div className="space-y-2">
                <p className="text-sm lg:text-base">Age: {calculateAge(trainee.birth_date)}</p>
                <p className="text-sm lg:text-base">Position: {trainee.preferred_position}</p>
                <p className="text-sm lg:text-base">Status: {trainee.status}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm lg:text-base">Email: {trainee.email}</p>
                <p className="text-sm lg:text-base">Phone: {trainee.phone}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 lg:p-6 border border-[#E6E6E6]">
            <h2 className="text-lg lg:text-xl font-bold text-black mb-6">Test Results</h2>
            
            {/* Form fields for test results */}
            {/* ... existing form fields ... */}
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#14D922] text-white py-2 px-4 rounded-md hover:bg-[#10B61E] disabled:opacity-50 text-sm lg:text-base"
              >
                {loading ? 'Submitting...' : 'Submit Test Results'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
} 