'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import html2canvas from 'html2canvas'

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

interface PositionResult {
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
}

interface TraineeProfile {
  name: string
  preferred_position: string
  birth_date: string
  test_result?: TestResult | null
  position_result?: PositionResult | null
  application_date: string
  status: 'Pending' | 'Accepted' | 'Rejected'
}

interface ApplicationResponse {
  status: 'Pending' | 'Accepted' | 'Rejected';
  submitted_at: string;
  trainee: {
    name: string;
    preferred_position: string;
    birth_date: string;
    test_results: TestResult[];
  };
}

export default function TraineeProfile({ params }: { params: { cid: string, id: string } }) {
  const [trainee, setTrainee] = useState<TraineeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    fetchTraineeData()
  }, [])

  const fetchTraineeData = async () => {
    try {
      // First, get the application data
      const { data: applicationData, error: applicationError } = await supabase
        .from('club_applications')
        .select(`
          status,
          submitted_at,
          trainee:trainees (
            name,
            preferred_position,
            birth_date
          )
        `)
        .eq('club_id', params.cid)
        .eq('trainee_uid', params.id)
        .single()

      if (applicationError) throw applicationError

      // Get the latest test result
      const { data: testResultData, error: testResultError } = await supabase
        .from('test_results')
        .select('*')
        .eq('tid', params.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (testResultError && testResultError.code !== 'PGRST116') {
        console.error('Error fetching test results:', testResultError)
        throw testResultError
      }

      // Get the latest position result
      const { data: positionResultData, error: positionResultError } = await supabase
        .from('position_results')
        .select('*')
        .eq('tid', params.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (positionResultError && positionResultError.code !== 'PGRST116') {
        console.error('Error fetching position results:', positionResultError)
        throw positionResultError
      }

      if (applicationData) {
        const data = applicationData as unknown as ApplicationResponse;
        const traineeData = data.trainee;
        
        setTrainee({
          name: traineeData.name,
          preferred_position: traineeData.preferred_position,
          birth_date: traineeData.birth_date,
          test_result: testResultData || null,
          position_result: positionResultData || null,
          application_date: data.submitted_at,
          status: data.status
        })
      }
    } catch (err) {
      console.error('Error fetching trainee data:', err)
      setError('Failed to load trainee data')
    } finally {
      setLoading(false)
    }
  }

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
  }

  const getPositionColor = (score: number) => {
    // Scale colors: 1 = red, 50 = yellow, 99 = green
    if (score <= 50) {
      // Scale from red to yellow (0-50)
      const percentage = (score - 1) / 49;
      const red = 255;
      const green = Math.round(255 * percentage);
      return `rgb(${red}, ${green}, 0)`;
    } else {
      // Scale from yellow to green (51-99)
      const percentage = (score - 50) / 49;
      const red = Math.round(255 * (1 - percentage));
      const green = 255;
      return `rgb(${red}, ${green}, 0)`;
    }
  }

  const getPositionStyle = (position: string) => {
    const positions: { [key: string]: { top: string; left: string } } = {
      st: { top: '15%', left: '50%' },
      lw: { top: '30%', left: '20%' },
      rw: { top: '30%', left: '80%' },
      cam: { top: '45%', left: '50%' },
      cm: { top: '60%', left: '50%' },
      lm: { top: '60%', left: '20%' },
      rm: { top: '60%', left: '80%' },
      lb: { top: '75%', left: '20%' },
      cb: { top: '75%', left: '50%' },
      rb: { top: '75%', left: '80%' },
      gk: { top: '90%', left: '50%' }
    };
    return positions[position] || { top: '50%', left: '50%' };
  }

  const getPositionBackgroundColor = (position: string) => {
    const positionTypes: { [key: string]: string } = {
      // Strikers
      st: '#1a365d', ls: '#1a365d', rs: '#1a365d',
      // Wingers/Forwards
      lw: '#1e40af', lf: '#1e40af', rf: '#1e40af', rw: '#1e40af',
      // Attacking midfielders
      lam: '#2563eb', cam: '#2563eb', ram: '#2563eb',
      // Central midfielders
      lm: '#3b82f6', lcm: '#3b82f6', cm: '#3b82f6', rcm: '#3b82f6', rm: '#3b82f6',
      // Defensive midfielders
      ldm: '#60a5fa', cdm: '#60a5fa', rdm: '#60a5fa',
      // Defenders
      lb: '#93c5fd', lcb: '#93c5fd', cb: '#93c5fd', rcb: '#93c5fd', rb: '#93c5fd',
      // Goalkeeper
      gk: '#dc2626'
    };
    return positionTypes[position] || '#4b5563';
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-[#5DD62C]'; // Bright green
    if (score >= 70) return 'bg-[#A1D642]'; // Light green
    if (score >= 60) return 'bg-[#DFDD3C]'; // Yellow-green
    if (score === 50) return 'bg-[#FFD700]'; // Yellow
    if (score >= 40) return 'bg-[#FFA500]'; // Orange
    if (score >= 30) return 'bg-[#FF6B00]'; // Dark orange
    return 'bg-[#FF0000]'; // Red
  }

  const handleDownloadReport = async () => {
    try {
      // Get the pitch visualization element
      const pitchElement = document.getElementById('pitch-visualization');
      if (!pitchElement) {
        console.error('Pitch visualization element not found');
        return;
      }

      // Convert the pitch visualization to base64
      const canvas = await html2canvas(pitchElement);
      const pitchImage = canvas.toDataURL('image/png');

      // Prepare the data
      const traineeData = {
        name: trainee?.name || '',
        preferred_position: trainee?.preferred_position || '',
        test_result: trainee?.test_result || {},
        position_result: trainee?.position_result || {}
      };

      // Call the API to generate the PDF
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traineeData,
          pitchImage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trainee-report-${traineeData.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      // You might want to show an error message to the user here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#000000] p-6">
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

  if (!trainee) {
    return (
      <div className="min-h-screen bg-white text-[#000000] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
            <p className="text-[#555555]">Trainee not found.</p>
          </div>
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
              onClick={() => router.push(`/dashboard/club/${params.cid}`)}
              className="px-4 py-2 bg-[#F5F5F5] text-[#000000] rounded-lg hover:bg-[#E6E6E6] transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B31A] transition-colors"
            >
              Download Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Info and Stats */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#555555] text-sm">Name</p>
                  <p className="font-medium">{trainee.name}</p>
                </div>
                <div>
                  <p className="text-[#555555] text-sm">Position</p>
                  <p className="font-medium">{trainee.preferred_position}</p>
                </div>
                <div>
                  <p className="text-[#555555] text-sm">Age</p>
                  <p className="font-medium">
                    {new Date().getFullYear() - new Date(trainee.birth_date).getFullYear()}
                  </p>
                </div>
                <div>
                  <p className="text-[#555555] text-sm">Application Status</p>
                  <p className={`font-medium ${
                    trainee.status === 'Accepted' ? 'text-[#14D922]' :
                    trainee.status === 'Rejected' ? 'text-[#F44336]' :
                    'text-[#FFC107]'
                  }`}>
                    {trainee.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
              <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                {['Physical', 'Mental', 'Technical', 'Goalkeeper'].map((category) => (
                  <div key={category} className="bg-[#F5F5F5] rounded-lg p-4">
                    <h3 className="text-sm text-[#555555] mb-2">{category}</h3>
                    <div className="text-2xl font-bold text-[#14D922]">
                      {calculateCategoryAverage(trainee.test_result, category)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Attributes */}
            <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
              <h2 className="text-xl font-semibold mb-6">Detailed Attributes</h2>
              
              {/* Physical Attributes */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Physical</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    const value = trainee.test_result?.[key as keyof TestResult] ?? 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className={`w-14 h-8 ${getScoreColor(value)} flex items-center justify-center rounded text-black font-bold`}>
                          {value}
                        </div>
                        <span className="text-[#555555] capitalize">{key.replace(/_/g, ' ')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mental Attributes */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Mental</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'aggression',
                    'att_position',
                    'composure',
                    'interceptions',
                    'vision'
                  ].map((key) => {
                    const value = trainee.test_result?.[key as keyof TestResult] ?? 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className={`w-14 h-8 ${getScoreColor(value)} flex items-center justify-center rounded text-black font-bold`}>
                          {value}
                        </div>
                        <span className="text-[#555555] capitalize">{key.replace(/_/g, ' ')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Technical Attributes */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Technical</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    const value = trainee.test_result?.[key as keyof TestResult] ?? 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className={`w-14 h-8 ${getScoreColor(value)} flex items-center justify-center rounded text-black font-bold`}>
                          {value}
                        </div>
                        <span className="text-[#555555] capitalize">{key.replace(/_/g, ' ')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Goalkeeper Attributes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Goalkeeping</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'gk_diving',
                    'gk_handling',
                    'gk_kicking',
                    'gk_positioning',
                    'gk_reflexes'
                  ].map((key) => {
                    const value = trainee.test_result?.[key as keyof TestResult] ?? 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className={`w-14 h-8 ${getScoreColor(value)} flex items-center justify-center rounded text-black font-bold`}>
                          {value}
                        </div>
                        <span className="text-[#555555] capitalize">{key.replace(/gk_/g, '').replace(/_/g, ' ')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Football Field */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 sm:p-6 border border-[#E6E6E6]">
              <h2 className="text-xl font-semibold mb-4 text-black">Position Visualization</h2>
              <div id="pitch-visualization" className="relative w-full" style={{ paddingBottom: '150%' }}>
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  {/* Field Background Image */}
                  <Image
                    src="/images/field.jpg"
                    alt="Football field"
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                  />
                  
                  {/* Position Markers */}
                  {trainee.position_result && Object.entries(trainee.position_result)
                    .filter(([key]) => ['st', 'lw', 'rw', 'cam', 'cm', 'lm', 'rm', 'lb', 'cb', 'rb', 'gk'].includes(key))
                    .map(([position, score]) => {
                      const style = getPositionStyle(position);
                      const scoreValue = Math.floor(score as number);
                      const backgroundColor = getPositionColor(scoreValue);
                      
                      return (
                        <div 
                          key={position} 
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 w-16 sm:w-20 md:w-24 lg:w-28" 
                          style={style}
                        >
                          <div className="flex flex-col items-center">
                            <div 
                              className="w-full text-center py-1 sm:py-2 px-2 sm:px-3 rounded-t text-[#1a1a1a] font-bold text-xs sm:text-sm md:text-base lg:text-lg"
                              style={{ backgroundColor }}
                            >
                              {position.toUpperCase()}
                            </div>
                            <div 
                              className="w-full text-center py-1 sm:py-2 px-2 sm:px-3 text-white font-bold rounded-b text-xs sm:text-sm md:text-base lg:text-lg"
                              style={{ backgroundColor: '#1a1a1a' }}
                            >
                              {scoreValue}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 