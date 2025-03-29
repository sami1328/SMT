'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface Trainee {
  tid: string
  name: string
  status: string
  birth_date: string
  test_result?: TestResult | null
}

interface Club {
  cid: string
  name: string
  location: string
  description: string
  logo_url: string | null
}

interface Application {
  id: string
  trainee_uid: string
  status: 'Pending' | 'Accepted' | 'Rejected'
  submitted_at: string
  feedback: string | null
  trainee: {
    name: string
    preferred_position: string
    birth_date: string
    test_result?: TestResult | null
  }
}

interface TeamMember {
  tid: string
  name: string
  preferred_position: string
  test_results: TestResult[]
}

interface TestResult {
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

export default function ClubDashboard({ params }: { params: { cid: string } }) {
  const [trainees, setTrainees] = useState<Trainee[]>([])
  const [traineeTestResults, setTraineeTestResults] = useState<{ [key: string]: TestResult }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [ageFilter, setAgeFilter] = useState('all')
  const traineesPerPage = 10
  const [selectedTrainee, setSelectedTrainee] = useState<Application | null>(null)
  const [showTestDetails, setShowTestDetails] = useState(false)
  const [club, setClub] = useState<Club | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [feedback, setFeedback] = useState('')
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    fetchTraineesData()
    fetchClubData()
    fetchApplications()
    fetchTeamMembers()
  }, [])

  const fetchTraineesData = async () => {
    try {
      // First fetch basic trainee data
      const { data: traineesData, error: traineesError } = await supabase
        .from('trainees')
        .select(`
          tid,
          name,
          status,
          birth_date
        `)
        .order('name')

      if (traineesError) throw traineesError
      
      // Then fetch their test results
      if (traineesData && traineesData.length > 0) {
        const traineeIds = traineesData.map(trainee => trainee.tid)
        const { data: testResultsData, error: testResultsError } = await supabase
          .from('test_results')
          .select('*')
          .in('tid', traineeIds)
          .order('created_at', { ascending: false })

        if (testResultsError) throw testResultsError

        // Create a map of latest test results for each trainee
        const latestTestResults: { [key: string]: TestResult } = {}
        testResultsData?.forEach(result => {
          if (!latestTestResults[result.tid]) {
            latestTestResults[result.tid] = result
          }
        })

        // Combine trainee data with their latest test result
        const traineesWithResults = traineesData.map(trainee => ({
          ...trainee,
          test_result: latestTestResults[trainee.tid] || null
        }))

        setTrainees(traineesWithResults)
        setTraineeTestResults(latestTestResults)
      } else {
        setTrainees([])
        setTraineeTestResults({})
      }
    } catch (err) {
      console.error('Error fetching trainees data:', err)
      setError(err instanceof Error ? err.message : 'Error fetching trainees')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get test result for a trainee
  const getTraineeTestResult = (traineeId: string) => {
    return traineeTestResults[traineeId] || null
  }

  const fetchClubData = async () => {
    try {
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('cid', params.cid)
        .single()

      if (clubError) throw clubError
      setClub(clubData)
    } catch (err) {
      console.error('Error fetching club data:', err)
      setError('Failed to load club data')
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('club_applications')
        .select(`
          *,
          trainee:trainees(
            name, 
            preferred_position, 
            birth_date,
            test_results(
              acceleration,
              agility,
              balance,
              jumping,
              reactions,
              sprint_speed,
              stamina,
              strength,
              aggression,
              att_position,
              composure,
              interceptions,
              vision,
              ball_control,
              crossing,
              curve,
              defensive_awareness,
              dribbling,
              fk_accuracy,
              finishing,
              heading_accuracy,
              long_passing,
              long_shots,
              penalties,
              short_passing,
              shot_power,
              sliding_tackle,
              standing_tackle,
              volleys,
              gk_diving,
              gk_handling,
              gk_kicking,
              gk_positioning,
              gk_reflexes
            )
          )
        `)
        .eq('club_id', params.cid)
        .order('submitted_at', { ascending: false })

      if (applicationsError) throw applicationsError

      // Transform the data to match our interface
      const transformedData = applicationsData?.map(app => ({
        ...app,
        trainee: {
          ...app.trainee,
          test_result: app.trainee.test_results?.[0] || null // Get the latest test result
        }
      }))

      setApplications(transformedData || [])
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('trainees')
        .select(`
          tid,
          name,
          preferred_position,
          test_results:test_results(*)
        `)
        .eq('final_club_id', params.cid)

      if (membersError) throw membersError
      setTeamMembers(membersData || [])
    } catch (err) {
      console.error('Error fetching team members:', err)
      setError('Failed to load team members')
    }
  }

  // Filter trainees based on search query, status, and age
  const filteredTrainees = trainees.filter(trainee => {
    const matchesSearch = trainee.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || trainee.status === statusFilter
    
    // Calculate age from birth_date
    const birthDate = new Date(trainee.birth_date)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    const matchesAge = ageFilter === 'all' || 
      (ageFilter === 'under18' && age < 18) ||
      (ageFilter === '18to25' && age >= 18 && age <= 25) ||
      (ageFilter === 'over25' && age > 25)
    
    return matchesSearch && matchesStatus && matchesAge
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredTrainees.length / traineesPerPage)
  const startIndex = (currentPage - 1) * traineesPerPage
  const endIndex = startIndex + traineesPerPage
  const currentTrainees = filteredTrainees.slice(startIndex, endIndex)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle filter changes
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleAgeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAgeFilter(e.target.value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const getApplicationStats = () => {
    const total = applications.length
    const pending = applications.filter(app => app.status === 'Pending').length
    const accepted = applications.filter(app => app.status === 'Accepted').length
    const rejected = applications.filter(app => app.status === 'Rejected').length

    return { total, pending, accepted, rejected }
  }

  const handleApplicationStatus = async (applicationId: string, status: 'Accepted' | 'Rejected') => {
    try {
      setError(null)
      const { error: updateError } = await supabase
        .from('club_applications')
        .update({
          status,
          feedback: feedback || (status === 'Accepted' ? 'Welcome to the team!' : 'Thank you for your interest.')
        })
        .eq('id', applicationId)

      if (updateError) throw updateError

      // Refresh applications and team members
      await Promise.all([fetchApplications(), fetchTeamMembers()])
    } catch (err) {
      console.error('Error updating application status:', err)
      setError('Failed to update application status')
    }
  }

  // Calculate category average with null check
  const calculateCategoryAverage = (testResult: TestResult | null | undefined, category: string) => {
    if (!testResult) return 0;

    switch (category) {
      case 'Physical':
        return Math.round(
          (testResult.acceleration + testResult.agility + testResult.balance + 
           testResult.jumping + testResult.reactions + testResult.sprint_speed + 
           testResult.stamina + testResult.strength) / 8
        );
      case 'Mental':
        return Math.round(
          (testResult.aggression + testResult.att_position + testResult.composure + 
           testResult.interceptions + testResult.vision) / 5
        );
      case 'Technical':
        return Math.round(
          (testResult.ball_control + testResult.crossing + testResult.curve + 
           testResult.defensive_awareness + testResult.dribbling + testResult.fk_accuracy + 
           testResult.finishing + testResult.heading_accuracy + testResult.long_passing + 
           testResult.long_shots + testResult.penalties + testResult.short_passing + 
           testResult.shot_power + testResult.sliding_tackle + testResult.standing_tackle + 
           testResult.volleys) / 17
        );
      case 'Goalkeeper':
        return Math.round(
          (testResult.gk_diving + testResult.gk_handling + testResult.gk_kicking + 
           testResult.gk_positioning + testResult.gk_reflexes) / 5
        );
      default:
        return 0;
    }
  };

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

  const stats = getApplicationStats()

  return (
    <div className="min-h-screen bg-white text-[#000000] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Club Dashboard</h1>

        {/* Club Info */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 mb-8">
          <div className="flex items-center space-x-4">
            {club?.logo_url && (
              <img
                src={club.logo_url}
                alt={`${club.name} logo`}
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{club?.name}</h2>
              <p className="text-[#555555]">{club?.location}</p>
              <p className="text-[#555555] mt-2">{club?.description}</p>
            </div>
          </div>
        </div>

        {/* Application Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <h3 className="text-[#555555] mb-2">Total Applications</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <h3 className="text-[#555555] mb-2">Pending</h3>
            <p className="text-2xl font-bold text-[#FFC107]">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <h3 className="text-[#555555] mb-2">Accepted</h3>
            <p className="text-2xl font-bold text-[#14D922]">{stats.accepted}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <h3 className="text-[#555555] mb-2">Rejected</h3>
            <p className="text-2xl font-bold text-[#F44336]">{stats.rejected}</p>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.slice(0, 5).map((application) => (
                <div key={application.id} className="bg-white rounded-lg border border-[#E6E6E6] p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{application.trainee.name}</h3>
                      <p className="text-[#555555] text-sm">
                        Position: {application.trainee.preferred_position} | 
                        Age: {new Date().getFullYear() - new Date(application.trainee.birth_date).getFullYear()}
                      </p>
                      <p className="text-xs text-[#555555] mt-1">
                        Applied on {new Date(application.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      application.status === 'Accepted' ? 'bg-[#14D922]/20 text-[#14D922]' :
                      application.status === 'Rejected' ? 'bg-[#F44336]/20 text-[#F44336]' :
                      'bg-[#FFC107]/20 text-[#FFC107]'
                    }`}>
                      {application.status}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-end space-x-4">
                    <button
                      onClick={() => router.push(`/dashboard/club/${params.cid}/trainee/${application.trainee_uid}`)}
                      className="px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B31A] transition-colors"
                    >
                      View Profile
                    </button>
                    {application.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleApplicationStatus(application.id, 'Rejected')}
                          className="px-4 py-2 bg-[#F44336] text-white rounded-lg hover:bg-[#D33A2C] transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApplicationStatus(application.id, 'Accepted')}
                          className="px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B31A] transition-colors"
                        >
                          Accept
                        </button>
                      </>
                    )}
                  </div>

                  {application.feedback && (
                    <div className="mt-3 p-3 bg-[#F5F5F5] rounded-lg">
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

        {/* Trainee Profile Modal */}
        {selectedTrainee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E6E6E6]">
                <h3 className="text-2xl font-bold">Trainee Profile</h3>
                <button
                  onClick={() => setSelectedTrainee(null)}
                  className="text-[#555555] hover:text-black transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Info and Stats */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-[#F5F5F5] rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-4">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[#555555] text-sm">Name</p>
                        <p className="font-medium">{selectedTrainee.trainee.name}</p>
                      </div>
                      <div>
                        <p className="text-[#555555] text-sm">Position</p>
                        <p className="font-medium">{selectedTrainee.trainee.preferred_position}</p>
                      </div>
                      <div>
                        <p className="text-[#555555] text-sm">Age</p>
                        <p className="font-medium">
                          {new Date().getFullYear() - new Date(selectedTrainee.trainee.birth_date).getFullYear()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#555555] text-sm">Application Date</p>
                        <p className="font-medium">
                          {new Date(selectedTrainee.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Overview */}
                  <div className="bg-[#F5F5F5] rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-4">Performance Overview</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {['Physical', 'Mental', 'Technical', 'Goalkeeper'].map((category) => (
                        <div key={category} className="bg-[#E6E6E6] rounded-lg p-3">
                          <h5 className="text-sm text-[#555555] mb-2">{category}</h5>
                          <div className="text-2xl font-bold text-[#14D922]">
                            {calculateCategoryAverage(selectedTrainee.trainee.test_result, category)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Attributes */}
                  <div className="bg-[#F5F5F5] rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-4">Detailed Attributes</h4>
                    
                    {/* Physical Attributes */}
                    <div className="mb-6">
                      <h5 className="text-md font-medium text-[#555555] mb-3">Physical</h5>
                      <div className="space-y-3">
                        {[
                          'acceleration',
                          'agility',
                          'balance',
                          'jumping',
                          'reactions',
                          'sprint_speed',
                          'stamina',
                          'strength'
                        ].map((key) => {
                          const value = selectedTrainee.trainee.test_result?.[key as keyof TestResult] ?? 0;
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-[#555555] capitalize">{key.replace(/_/g, ' ')}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-[#E6E6E6] rounded-full h-2">
                                  <div 
                                    className="bg-[#14D922] h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${value}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium w-8 text-right">{value}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mental Attributes */}
                    <div className="mb-6">
                      <h5 className="text-md font-medium text-[#555555] mb-3">Mental</h5>
                      <div className="space-y-3">
                        {[
                          'aggression',
                          'att_position',
                          'composure',
                          'interceptions',
                          'vision'
                        ].map((key) => {
                          const value = selectedTrainee.trainee.test_result?.[key as keyof TestResult] ?? 0;
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-[#555555] capitalize">{key.replace(/_/g, ' ')}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-[#E6E6E6] rounded-full h-2">
                                  <div 
                                    className="bg-[#14D922] h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${value}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium w-8 text-right">{value}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Technical Attributes */}
                    <div className="mb-6">
                      <h5 className="text-md font-medium text-[#555555] mb-3">Technical</h5>
                      <div className="space-y-3">
                        {[
                          'ball_control',
                          'crossing',
                          'curve',
                          'defensive_awareness',
                          'dribbling',
                          'fk_accuracy',
                          'finishing',
                          'heading_accuracy',
                          'long_passing',
                          'long_shots',
                          'penalties',
                          'short_passing',
                          'shot_power',
                          'sliding_tackle',
                          'standing_tackle',
                          'volleys'
                        ].map((key) => {
                          const value = selectedTrainee.trainee.test_result?.[key as keyof TestResult] ?? 0;
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-[#555555] capitalize">{key.replace(/_/g, ' ')}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-[#E6E6E6] rounded-full h-2">
                                  <div 
                                    className="bg-[#14D922] h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${value}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium w-8 text-right">{value}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Goalkeeper Attributes */}
                    <div>
                      <h5 className="text-md font-medium text-[#555555] mb-3">Goalkeeper</h5>
                      <div className="space-y-3">
                        {[
                          'gk_diving',
                          'gk_handling',
                          'gk_kicking',
                          'gk_positioning',
                          'gk_reflexes'
                        ].map((key) => {
                          const value = selectedTrainee.trainee.test_result?.[key as keyof TestResult] ?? 0;
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-[#555555] capitalize">{key.replace(/_/g, ' ')}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-[#E6E6E6] rounded-full h-2">
                                  <div 
                                    className="bg-[#14D922] h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${value}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium w-8 text-right">{value}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Football Field */}
                <div className="bg-[#F5F5F5] rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-4">Position Visualization</h4>
                  <div className="relative w-full" style={{ paddingBottom: '150%' }}>
                    <div className="absolute inset-0 bg-[#2D5A27] rounded-lg overflow-hidden">
                      {/* Field Lines */}
                      <div className="absolute inset-0 border-2 border-white/30 rounded-lg" />
                      {/* Center Circle */}
                      <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
                      {/* Center Line */}
                      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/30 -translate-x-1/2" />
                      {/* Penalty Areas */}
                      <div className="absolute top-0 left-1/2 w-48 h-36 border-2 border-white/30 -translate-x-1/2" />
                      <div className="absolute bottom-0 left-1/2 w-48 h-36 border-2 border-white/30 -translate-x-1/2" />
                      {/* Goal Areas */}
                      <div className="absolute top-0 left-1/2 w-24 h-12 border-2 border-white/30 -translate-x-1/2" />
                      <div className="absolute bottom-0 left-1/2 w-24 h-12 border-2 border-white/30 -translate-x-1/2" />
                      
                      {/* Position Marker */}
                      <div className={`absolute w-6 h-6 bg-[#14D922] rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 ${
                        selectedTrainee.trainee.preferred_position.toLowerCase().includes('forward') ? 'top-[25%] left-1/2' :
                        selectedTrainee.trainee.preferred_position.toLowerCase().includes('midfielder') ? 'top-1/2 left-1/2' :
                        selectedTrainee.trainee.preferred_position.toLowerCase().includes('defender') ? 'top-[75%] left-1/2' :
                        selectedTrainee.trainee.preferred_position.toLowerCase().includes('goalkeeper') ? 'top-[90%] left-1/2' :
                        'top-1/2 left-1/2'
                      }`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Section */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <span className="text-sm text-[#555555]">
              {teamMembers.length} {teamMembers.length === 1 ? 'Member' : 'Members'}
            </span>
          </div>

          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div key={member.tid} className="bg-[#F5F5F5] rounded-lg p-4">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-[#555555]">Position: {member.preferred_position}</p>
                  {member.test_results && member.test_results.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-[#555555]">
                        Latest Test Score: {Math.round(
                          (member.test_results[0].acceleration + member.test_results[0].agility + 
                           member.test_results[0].balance + member.test_results[0].jumping + 
                           member.test_results[0].reactions + member.test_results[0].sprint_speed + 
                           member.test_results[0].stamina + member.test_results[0].strength) / 8
                        )}
                      </p>
                      <button
                        onClick={() => router.push(`/dashboard/club/${params.cid}/applications/${member.tid}`)}
                        className="text-sm text-[#14D922] hover:text-[#10B31A]"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#555555]">No team members yet.</p>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-[#F44336]/20 text-[#F44336] rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 