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
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<'accept' | 'reject' | null>(null)

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

      // Get the application data first to get the trainee_uid
      const { data: applicationData, error: fetchError } = await supabase
        .from('club_applications')
        .select(`
          trainee_uid,
          trainee:trainees (
            final_club_id
          )
        `)
        .eq('id', applicationId)
        .single()

      if (fetchError) throw fetchError

      // Check if trainee already has a final club when trying to accept
      if (status === 'Accepted' && applicationData.trainee?.[0]?.final_club_id) {
        setError('This trainee has already selected their final club')
        return
      }

      // Update application status only
      const { error: updateError } = await supabase
        .from('club_applications')
        .update({
          status,
          feedback: feedback || (status === 'Accepted' ? 'Application accepted! Waiting for trainee confirmation.' : 'Thank you for your interest.')
        })
        .eq('id', applicationId)

      if (updateError) throw updateError

      // Refresh applications and team members
      await Promise.all([fetchApplications(), fetchTeamMembers()])
      
      // Clear any feedback and selected application
      setFeedback('')
      setSelectedApplication(null)
      setConfirmAction(null)
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

  const handleConfirmAction = async () => {
    if (selectedApplication && confirmAction) {
      await handleApplicationStatus(
        selectedApplication, 
        confirmAction === 'accept' ? 'Accepted' : 'Rejected'
      )
      setSelectedApplication(null)
      setConfirmAction(null)
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

  const stats = getApplicationStats()

  return (
    <div className="min-h-screen bg-white text-[#000000] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Club Dashboard</h1>

        {/* Club Info */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {club?.logo_url && (
              <img
                src={club.logo_url}
                alt={`${club.name} logo`}
                className="w-16 h-16 object-contain mx-auto sm:mx-0"
              />
            )}
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold">{club?.name}</h2>
              <p className="text-[#555555]">{club?.location}</p>
              <p className="text-[#555555] mt-2">{club?.description}</p>
            </div>
          </div>
        </div>

        {/* Application Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-3 sm:p-6">
            <h3 className="text-[#555555] text-sm sm:text-base mb-1 sm:mb-2">Total Applications</h3>
            <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-3 sm:p-6">
            <h3 className="text-[#555555] text-sm sm:text-base mb-1 sm:mb-2">Pending</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#FFC107]">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-3 sm:p-6">
            <h3 className="text-[#555555] text-sm sm:text-base mb-1 sm:mb-2">Accepted</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#14D922]">{stats.accepted}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-3 sm:p-6">
            <h3 className="text-[#555555] text-sm sm:text-base mb-1 sm:mb-2">Rejected</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#F44336]">{stats.rejected}</p>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Recent Applications</h2>
          {applications.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {applications.slice(0, 5).map((application) => (
                <div key={application.id} className="bg-white rounded-lg border border-[#E6E6E6] p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                    <div>
                      <h3 className="font-semibold text-center sm:text-left">{application.trainee.name}</h3>
                      <p className="text-[#555555] text-sm text-center sm:text-left">
                        Position: {application.trainee.preferred_position} | 
                        Age: {new Date().getFullYear() - new Date(application.trainee.birth_date).getFullYear()}
                      </p>
                      <p className="text-xs text-[#555555] mt-1 text-center sm:text-left">
                        Applied on {new Date(application.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm self-center sm:self-start ${
                      application.status === 'Accepted' ? 'bg-[#14D922]/20 text-[#14D922]' :
                      application.status === 'Rejected' ? 'bg-[#F44336]/20 text-[#F44336]' :
                      'bg-[#FFC107]/20 text-[#FFC107]'
                    }`}>
                      {application.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center sm:justify-end gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/club/${params.cid}/trainee/${application.trainee_uid}`)}
                      className="px-3 py-1.5 bg-[#14D922] text-white rounded-lg hover:bg-[#10B31A] transition-colors text-sm"
                    >
                      View Profile
                    </button>
                    {application.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedApplication(application.id)
                            setConfirmAction('reject')
                          }}
                          className="px-3 py-1.5 bg-[#F44336] text-white rounded-lg hover:bg-[#D33A2C] transition-colors text-sm"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApplication(application.id)
                            setConfirmAction('accept')
                          }}
                          className="px-3 py-1.5 bg-[#14D922] text-white rounded-lg hover:bg-[#10B31A] transition-colors text-sm"
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
            <p className="text-[#555555] text-center sm:text-left">No applications yet.</p>
          )}
        </div>

        {/* Confirmation Modal */}
        {selectedApplication && confirmAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">
                {confirmAction === 'accept' ? 'Accept Application' : 'Reject Application'}
              </h3>
              <p className="text-[#555555] mb-4">
                {confirmAction === 'accept' 
                  ? 'Are you sure you want to accept this application?' 
                  : 'Are you sure you want to reject this application?'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => {
                    setSelectedApplication(null)
                    setConfirmAction(null)
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-[#E6E6E6] text-[#000000] rounded-lg hover:bg-[#D6D6D6] transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`w-full sm:w-auto px-4 py-2 text-white rounded-lg transition-colors text-sm ${
                    confirmAction === 'accept'
                      ? 'bg-[#14D922] hover:bg-[#10B31A]'
                      : 'bg-[#F44336] hover:bg-[#D33A2C]'
                  }`}
                >
                  {confirmAction === 'accept' ? 'Accept' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Team Section */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 sm:p-6 mt-4 sm:mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-semibold">Team Members</h2>
            <span className="text-sm text-[#555555]">
              {teamMembers.length} {teamMembers.length === 1 ? 'Member' : 'Members'}
            </span>
          </div>

          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {teamMembers.map((member) => (
                <div key={member.tid} className="bg-[#F5F5F5] rounded-lg p-4">
                  <h3 className="font-semibold text-center sm:text-left">{member.name}</h3>
                  <p className="text-[#555555] text-center sm:text-left">Position: {member.preferred_position}</p>
                  {member.test_results && member.test_results.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-[#555555] text-center sm:text-left">
                        Latest Test Score: {Math.round(
                          (member.test_results[0].acceleration + member.test_results[0].agility + 
                           member.test_results[0].balance + member.test_results[0].jumping + 
                           member.test_results[0].reactions + member.test_results[0].sprint_speed + 
                           member.test_results[0].stamina + member.test_results[0].strength) / 8
                        )}
                      </p>
                      <button
                        onClick={() => router.push(`/dashboard/club/${params.cid}/applications/${member.tid}`)}
                        className="w-full sm:w-auto text-sm text-[#14D922] hover:text-[#10B31A] text-center sm:text-left"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#555555] text-center sm:text-left">No team members yet.</p>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-[#F44336]/20 text-[#F44336] rounded-lg text-center sm:text-left">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 