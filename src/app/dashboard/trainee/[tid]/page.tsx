'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Trainee {
  tid: string;
  name: string;
  birth_date: string;
  preferred_position: string;
  status: string;
  final_club_id: string | null;
  email: string;
  phone: string;
}

interface Application {
  id: string;
  club_id: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  submitted_at: string;
  feedback: string | null;
  club: {
    name: string;
    location: string;
  };
}

interface Club {
  cid: string;
  name: string;
  location: string;
  description: string;
  logo_url: string | null;
}

interface TestResult {
  id: string;
  tid: string;
  acceleration: number;
  agility: number;
  balance: number;
  jumping: number;
  reactions: number;
  sprint_speed: number;
  stamina: number;
  strength: number;
  aggression: number;
  att_position: number;
  composure: number;
  interceptions: number;
  vision: number;
  ball_control: number;
  crossing: number;
  curve: number;
  defensive_awareness: number;
  dribbling: number;
  fk_accuracy: number;
  finishing: number;
  heading_accuracy: number;
  long_passing: number;
  long_shots: number;
  penalties: number;
  short_passing: number;
  shot_power: number;
  sliding_tackle: number;
  standing_tackle: number;
  volleys: number;
  gk_diving: number;
  gk_handling: number;
  gk_kicking: number;
  gk_positioning: number;
  gk_reflexes: number;
  created_at: string;
}

export default function TraineeDashboard({ params }: { params: { tid: string } }) {
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingToClub, setApplyingToClub] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchTraineeData();
    fetchApplications();
    if (trainee?.status === 'Test Completed') {
      fetchClubs();
      fetchTestResults();
    }
  }, [trainee?.status]);

  const fetchTraineeData = async () => {
    try {
      const { data: traineeData, error: traineeError } = await supabase
        .from('trainees')
        .select('*')
        .eq('tid', params.tid)
        .single();

      if (traineeError) throw traineeError;
      setTrainee(traineeData);
    } catch (err) {
      console.error('Error fetching trainee data:', err);
      setError('Failed to load trainee data');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('club_applications')
        .select(`
          *,
          club:clubs(name, location)
        `)
        .eq('trainee_uid', params.tid)
        .order('submitted_at', { ascending: false });

      if (applicationsError) throw applicationsError;
      setApplications(applicationsData || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    }
  };

  const fetchClubs = async () => {
    try {
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('*');

      if (clubsError) throw clubsError;
      setClubs(clubsData || []);
    } catch (err) {
      console.error('Error fetching clubs:', err);
      setError('Failed to load clubs');
    }
  };

  const fetchTestResults = async () => {
    try {
      console.log('Fetching test results for trainee:', params.tid);
      const { data: testData, error: testError } = await supabase
        .from('test_results')
        .select('*')
        .eq('tid', params.tid)
        .order('created_at', { ascending: false });

      if (testError) {
        console.error('Supabase error:', testError);
        throw testError;
      }

      console.log('Test results data:', testData);
      if (!testData || testData.length === 0) {
        console.log('No test results found for trainee');
        setTestResults([]);
      } else {
        setTestResults(testData);
      }
    } catch (err) {
      console.error('Error fetching test results:', err);
      setError('Failed to load test results. Please try again later.');
    }
  };

  const handleApplyToClub = async (cid: string) => {
    try {
      setApplyingToClub(cid);
      setError(null);

      // First check if trainee has completed the test
      if (trainee?.status !== 'Test Completed') {
        setError('You must complete the test before applying to clubs');
        return;
      }

      // Check if trainee has already selected a final club
      if (trainee?.final_club_id) {
        setError('You cannot apply to clubs after selecting your final club');
        return;
      }

      // Check if already applied
      const existingApplication = applications.find(app => app.club_id === cid);
      if (existingApplication) {
        setError('You have already applied to this club');
        return;
      }

      // Insert the application
      const { data, error: applicationError } = await supabase
        .from('club_applications')
        .insert({
          trainee_uid: params.tid,
          club_id: cid,
          status: 'Pending'
        })
        .select(`
          *,
          club:clubs(name, location)
        `)
        .single();

      if (applicationError) {
        console.error('Application error:', applicationError);
        if (applicationError.code === '23505') { // Unique violation
          setError('You have already applied to this club');
        } else if (applicationError.code === 'P0001') { // Trigger violation
          setError('You cannot apply to clubs after selecting your final club');
        } else {
          setError(applicationError.message || 'Failed to submit application');
        }
        return;
      }

      if (!data) {
        throw new Error('No data returned from application submission');
      }

      // Refresh applications list
      await fetchApplications();
    } catch (err) {
      console.error('Error applying to club:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
    } finally {
      setApplyingToClub(null);
    }
  };

  const handleSelectFinalClub = async (cid: string) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('trainees')
        .update({ final_club_id: cid })
        .eq('tid', params.tid);

      if (updateError) throw updateError;

      // Update local state
      setTrainee(prev => prev ? { ...prev, final_club_id: cid } : null);

      // Update status of other accepted applications to rejected
      const { error: applicationsError } = await supabase
        .from('club_applications')
        .update({ status: 'Rejected', feedback: 'Trainee selected another club' })
        .eq('trainee_uid', params.tid)
        .eq('status', 'Accepted')
        .neq('club_id', cid);

      if (applicationsError) throw applicationsError;

      // Refresh applications
      await fetchApplications();
    } catch (err) {
      console.error('Error selecting final club:', err);
      setError('Failed to select final club. Please try again.');
    }
  };

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
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Trainee Dashboard</h1>

        {/* Profile and Status Section */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-[#E6E6E6]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-black mb-4">Your Profile</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#555555]">
                      {trainee?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-black">{trainee?.name}</h3>
                    <p className="text-[#555555]">{trainee?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#555555]">Preferred Position</p>
                    <p className="font-medium text-black">{trainee?.preferred_position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#555555]">Phone</p>
                    <p className="font-medium text-black">{trainee?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#555555]">Birth Date</p>
                    <p className="font-medium text-black">{trainee?.birth_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#555555]">Age</p>
                    <p className="font-medium text-black">
                      {trainee?.birth_date ? 
                        Math.floor((new Date().getTime() - new Date(trainee.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-64">
              <h2 className="text-xl font-semibold text-black mb-4">Your Status</h2>
              <div className="bg-white rounded-lg p-4 border border-[#E6E6E6]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#555555]">Test Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    trainee?.status === 'Test Completed' ? 'bg-[#14D922]/20 text-[#14D922]' :
                    trainee?.status === 'Test Failed' ? 'bg-red-500/20 text-red-600' :
                    'bg-yellow-500/20 text-yellow-600'
                  }`}>
                    {trainee?.status}
                  </span>
                </div>
                {trainee?.status === 'Test Completed' && (
                  <div className="mt-4">
                    <p className="text-sm text-[#555555] mb-2">Latest Test Score:</p>
                    {testResults.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Physical</span>
                          <span className="font-medium text-[#14D922]">
                            {Math.round(
                              (testResults[0].acceleration + testResults[0].agility + 
                               testResults[0].balance + testResults[0].jumping + 
                               testResults[0].reactions + testResults[0].sprint_speed + 
                               testResults[0].stamina + testResults[0].strength) / 8
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Mental</span>
                          <span className="font-medium text-[#14D922]">
                            {Math.round(
                              (testResults[0].aggression + testResults[0].att_position + 
                               testResults[0].composure + testResults[0].interceptions + 
                               testResults[0].vision) / 5
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Technical</span>
                          <span className="font-medium text-[#14D922]">
                            {Math.round(
                              (testResults[0].ball_control + testResults[0].crossing + 
                               testResults[0].curve + testResults[0].defensive_awareness + 
                               testResults[0].dribbling + testResults[0].fk_accuracy + 
                               testResults[0].finishing + testResults[0].heading_accuracy + 
                               testResults[0].long_passing + testResults[0].long_shots + 
                               testResults[0].penalties + testResults[0].short_passing + 
                               testResults[0].shot_power + testResults[0].sliding_tackle + 
                               testResults[0].standing_tackle + testResults[0].volleys) / 17
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Goalkeeper</span>
                          <span className="font-medium text-[#14D922]">
                            {Math.round(
                              (testResults[0].gk_diving + testResults[0].gk_handling + 
                               testResults[0].gk_kicking + testResults[0].gk_positioning + 
                               testResults[0].gk_reflexes) / 5
                            )}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[#555555]">No test results available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Test Results Section */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-[#E6E6E6]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black">Test Results</h2>
            <span className="text-sm text-[#555555]">
              {testResults.length} {testResults.length === 1 ? 'Test' : 'Tests'}
            </span>
          </div>

          {testResults.length > 0 ? (
            <div className="space-y-6">
              {testResults.map((result, index) => (
                <div key={result.id} className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-semibold text-lg text-black">Test #{testResults.length - index}</h3>
                      <p className="text-[#555555] text-sm">
                        Taken on {new Date(result.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#555555]">Overall Average</p>
                      <p className="text-2xl font-bold text-[#14D922]">
                        {Math.round(
                          (result.acceleration + result.agility + result.balance + result.jumping +
                           result.reactions + result.sprint_speed + result.stamina + result.strength +
                           result.aggression + result.att_position + result.composure + result.interceptions +
                           result.vision + result.ball_control + result.crossing + result.curve +
                           result.defensive_awareness + result.dribbling + result.fk_accuracy +
                           result.finishing + result.heading_accuracy + result.long_passing +
                           result.long_shots + result.penalties + result.short_passing +
                           result.shot_power + result.sliding_tackle + result.standing_tackle +
                           result.volleys + result.gk_diving + result.gk_handling +
                           result.gk_kicking + result.gk_positioning + result.gk_reflexes) / 35
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Physical Attributes */}
                    <div className="bg-white rounded-lg p-4 border border-[#E6E6E6]">
                      <h4 className="font-semibold mb-3 text-[#14D922]">Physical Attributes</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Acceleration</span>
                          <span className={`font-medium ${
                            result.acceleration >= 80 ? 'text-[#14D922]' :
                            result.acceleration >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.acceleration}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Agility</span>
                          <span className={`font-medium ${
                            result.agility >= 80 ? 'text-[#14D922]' :
                            result.agility >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.agility}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Balance</span>
                          <span className={`font-medium ${
                            result.balance >= 80 ? 'text-[#14D922]' :
                            result.balance >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.balance}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Jumping</span>
                          <span className={`font-medium ${
                            result.jumping >= 80 ? 'text-[#14D922]' :
                            result.jumping >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.jumping}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Reactions</span>
                          <span className={`font-medium ${
                            result.reactions >= 80 ? 'text-[#14D922]' :
                            result.reactions >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.reactions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Sprint Speed</span>
                          <span className={`font-medium ${
                            result.sprint_speed >= 80 ? 'text-[#14D922]' :
                            result.sprint_speed >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.sprint_speed}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Stamina</span>
                          <span className={`font-medium ${
                            result.stamina >= 80 ? 'text-[#14D922]' :
                            result.stamina >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.stamina}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Strength</span>
                          <span className={`font-medium ${
                            result.strength >= 80 ? 'text-[#14D922]' :
                            result.strength >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.strength}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mental Attributes */}
                    <div className="bg-white rounded-lg p-4 border border-[#E6E6E6]">
                      <h4 className="font-semibold mb-3 text-[#14D922]">Mental Attributes</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Aggression</span>
                          <span className={`font-medium ${
                            result.aggression >= 80 ? 'text-[#14D922]' :
                            result.aggression >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.aggression}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Att. Position</span>
                          <span className={`font-medium ${
                            result.att_position >= 80 ? 'text-[#14D922]' :
                            result.att_position >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.att_position}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Composure</span>
                          <span className={`font-medium ${
                            result.composure >= 80 ? 'text-[#14D922]' :
                            result.composure >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.composure}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Interceptions</span>
                          <span className={`font-medium ${
                            result.interceptions >= 80 ? 'text-[#14D922]' :
                            result.interceptions >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.interceptions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Vision</span>
                          <span className={`font-medium ${
                            result.vision >= 80 ? 'text-[#14D922]' :
                            result.vision >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.vision}</span>
                        </div>
                      </div>
                    </div>

                    {/* Technical Attributes */}
                    <div className="bg-white rounded-lg p-4 border border-[#E6E6E6]">
                      <h4 className="font-semibold mb-3 text-[#14D922]">Technical Attributes</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Ball Control</span>
                          <span className={`font-medium ${
                            result.ball_control >= 80 ? 'text-[#14D922]' :
                            result.ball_control >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.ball_control}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Crossing</span>
                          <span className={`font-medium ${
                            result.crossing >= 80 ? 'text-[#14D922]' :
                            result.crossing >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.crossing}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Curve</span>
                          <span className={`font-medium ${
                            result.curve >= 80 ? 'text-[#14D922]' :
                            result.curve >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.curve}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Def. Awareness</span>
                          <span className={`font-medium ${
                            result.defensive_awareness >= 80 ? 'text-[#14D922]' :
                            result.defensive_awareness >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.defensive_awareness}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Dribbling</span>
                          <span className={`font-medium ${
                            result.dribbling >= 80 ? 'text-[#14D922]' :
                            result.dribbling >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.dribbling}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">FK Accuracy</span>
                          <span className={`font-medium ${
                            result.fk_accuracy >= 80 ? 'text-[#14D922]' :
                            result.fk_accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.fk_accuracy}</span>
                        </div>
                      </div>
                    </div>

                    {/* Goalkeeper Attributes */}
                    <div className="bg-white rounded-lg p-4 border border-[#E6E6E6]">
                      <h4 className="font-semibold mb-3 text-[#14D922]">Goalkeeper Attributes</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Diving</span>
                          <span className={`font-medium ${
                            result.gk_diving >= 80 ? 'text-[#14D922]' :
                            result.gk_diving >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.gk_diving}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Handling</span>
                          <span className={`font-medium ${
                            result.gk_handling >= 80 ? 'text-[#14D922]' :
                            result.gk_handling >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.gk_handling}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Kicking</span>
                          <span className={`font-medium ${
                            result.gk_kicking >= 80 ? 'text-[#14D922]' :
                            result.gk_kicking >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.gk_kicking}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Positioning</span>
                          <span className={`font-medium ${
                            result.gk_positioning >= 80 ? 'text-[#14D922]' :
                            result.gk_positioning >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.gk_positioning}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#555555]">Reflexes</span>
                          <span className={`font-medium ${
                            result.gk_reflexes >= 80 ? 'text-[#14D922]' :
                            result.gk_reflexes >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{result.gk_reflexes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#555555]">No test results available.</p>
          )}
        </div>

        {/* Applications Section */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-[#E6E6E6]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black">Your Applications</h2>
            <span className="text-sm text-[#555555]">
              {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
            </span>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg p-4 border border-[#E6E6E6]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-black">{application.club.name}</h3>
                      <p className="text-[#555555]">{application.club.location}</p>
                      <p className="text-xs text-[#555555] mt-1">
                        Applied on {new Date(application.submitted_at).toLocaleDateString()}
                      </p>
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
                    <div className="mt-3 p-3 bg-[#F5F5F5] rounded-lg">
                      <p className="text-sm text-[#555555]">{application.feedback}</p>
                    </div>
                  )}
                  {application.status === 'Accepted' && !trainee?.final_club_id && (
                    <button
                      onClick={() => handleSelectFinalClub(application.club_id)}
                      className="mt-3 px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B61E] transition-colors"
                    >
                      Select as Final Club
                    </button>
                  )}
                  {trainee?.final_club_id === application.club_id && (
                    <div className="mt-3 p-3 bg-[#14D922]/20 text-[#14D922] rounded-lg">
                      <p className="text-sm">Selected as your final club</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#555555]">No applications yet.</p>
          )}
        </div>

        {/* Available Clubs Section (Only for Test Completed and no final club) */}
        {trainee?.status === 'Test Completed' && !trainee?.final_club_id && (
          <div className="bg-white rounded-lg p-6 mb-8 border border-[#E6E6E6]">
            <h2 className="text-xl font-semibold text-black mb-4">Available Clubs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club) => {
                const application = applications.find(app => app.club_id === club.cid);
                const isApplying = applyingToClub === club.cid;
                const isRejected = application?.status === 'Rejected';

                return (
                  <div key={club.cid} className="bg-white rounded-lg p-4 border border-[#E6E6E6] relative">
                    {club.logo_url && (
                      <img
                        src={club.logo_url}
                        alt={`${club.name} logo`}
                        className="w-16 h-16 object-contain mb-4"
                      />
                    )}
                    <h3 className="font-semibold text-lg mb-2 text-black">{club.name}</h3>
                    <p className="text-[#555555] text-sm mb-2">{club.location}</p>
                    <p className="text-[#555555] text-sm mb-4">{club.description}</p>
                    
                    {application ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            application.status === 'Accepted' ? 'bg-[#14D922]/20 text-[#14D922]' :
                            application.status === 'Rejected' ? 'bg-red-500/20 text-red-600' :
                            'bg-yellow-500/20 text-yellow-600'
                          }`}>
                            {application.status}
                          </span>
                          <span className="text-xs text-[#555555]">
                            Applied {new Date(application.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                        {application.feedback && (
                          <div className="mt-2 p-3 bg-[#F5F5F5] rounded-lg">
                            <p className="text-sm text-[#555555]">{application.feedback}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApplyToClub(club.cid)}
                        disabled={isApplying}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isApplying
                            ? 'bg-[#F5F5F5] text-[#555555] cursor-wait'
                            : 'bg-[#14D922] text-white hover:bg-[#10B61E]'
                        }`}
                      >
                        {isApplying ? 'Applying...' : 'Apply to Club'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {trainee?.final_club_id && (
          <div className="bg-[#14D922]/20 text-[#14D922] rounded-lg p-4 mb-8">
            <h3 className="font-semibold mb-2">Final Club Selected</h3>
            <p>You have selected your final club. No further applications can be submitted.</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}