'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface TraineeDetailProps {
  params: {
    tid: string
  }
}

export default function TraineeDetail({ params }: TraineeDetailProps) {
  const router = useRouter()
  const [trainee, setTrainee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTrainee = async () => {
      try {
        const response = await fetch(`/api/trainees/${params.tid}`)
        if (!response.ok) throw new Error('Failed to fetch trainee')
        const data = await response.json()
        setTrainee(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTrainee()
  }, [params.tid])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5DD62C]"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !trainee) {
    return (
      <DashboardLayout>
        <div className="text-red-500 text-center py-4">{error || 'Trainee not found'}</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Trainee Details</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <pre>{JSON.stringify(trainee, null, 2)}</pre>
        </div>
      </div>
    </DashboardLayout>
  )
} 