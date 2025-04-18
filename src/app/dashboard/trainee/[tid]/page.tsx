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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trainee Dashboard</h1>

        {/* Profile and Status Section - Made more compact on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xl sm:text-2xl font-bold text-gray-600">
                    {trainee?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{trainee?.name}</h3>
                  <p className="text-sm text-gray-600">{trainee?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Preferred Position</p>
                  <p className="text-sm font-medium text-gray-900">{trainee?.preferred_position}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{trainee?.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Birth Date</p>
                  <p className="text-sm font-medium text-gray-900">{trainee?.birth_date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="text-sm font-medium text-gray-900">
                    {trainee?.birth_date ? 
                      Math.floor((new Date().getTime() - new Date(trainee.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Your Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Test Status:</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  trainee?.status === 'Test Completed' ? 'bg-green-100 text-green-800' :
                  trainee?.status === 'Test Failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {trainee?.status}
                </span>
              </div>

              {trainee?.status === 'Test Completed' && testResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">Latest Test Scores</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Physical</span>
                        <span className="text-sm font-medium text-green-600">
                          {Math.round(
                            (testResults[0].acceleration + testResults[0].agility + 
                             testResults[0].balance + testResults[0].jumping + 
                             testResults[0].reactions + testResults[0].sprint_speed + 
                             testResults[0].stamina + testResults[0].strength) / 8
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Mental</span>
                        <span className="text-sm font-medium text-green-600">
                          {Math.round(
                            (testResults[0].aggression + testResults[0].att_position + 
                             testResults[0].composure + testResults[0].interceptions + 
                             testResults[0].vision) / 5
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Technical</span>
                        <span className="text-sm font-medium text-green-600">
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
                        <span className="text-xs text-gray-600">Goalkeeper</span>
                        <span className="text-sm font-medium text-green-600">
                          {Math.round(
                            (testResults[0].gk_diving + testResults[0].gk_handling + 
                             testResults[0].gk_kicking + testResults[0].gk_positioning + 
                             testResults[0].gk_reflexes) / 5
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Results Section - Improved card layout */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Test Results</h2>
            <span className="text-sm text-gray-600">
              {testResults.length} {testResults.length === 1 ? 'Test' : 'Tests'}
            </span>
          </div>

          {testResults.length > 0 ? (
            <div className="space-y-6">
              {testResults.map((result, index) => (
                <div key={result.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Test #{testResults.length - index}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(result.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="w-full sm:w-auto text-center sm:text-right">
                        <p className="text-sm text-gray-600">Overall Average</p>
                        <p className="text-2xl font-bold text-green-600">
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                    {/* Physical Attributes */}
                    <div className="p-4">
                      <h4 className="font-medium text-green-600 mb-3">Physical</h4>
                      <div className="space-y-2">
                        {[
                          ['Acceleration', result.acceleration],
                          ['Agility', result.agility],
                          ['Balance', result.balance],
                          ['Jumping', result.jumping],
                          ['Reactions', result.reactions],
                          ['Sprint Speed', result.sprint_speed],
                          ['Stamina', result.stamina],
                          ['Strength', result.strength]
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{label}</span>
                            <span className={`text-sm font-medium ${
                              Number(value) >= 80 ? 'text-green-600' :
                              Number(value) >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mental Attributes */}
                    <div className="p-4">
                      <h4 className="font-medium text-green-600 mb-3">Mental</h4>
                      <div className="space-y-2">
                        {[
                          ['Aggression', result.aggression],
                          ['Att. Position', result.att_position],
                          ['Composure', result.composure],
                          ['Interceptions', result.interceptions],
                          ['Vision', result.vision]
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{label}</span>
                            <span className={`text-sm font-medium ${
                              Number(value) >= 80 ? 'text-green-600' :
                              Number(value) >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technical Attributes */}
                    <div className="p-4">
                      <h4 className="font-medium text-green-600 mb-3">Technical</h4>
                      <div className="space-y-2">
                        {[
                          ['Ball Control', result.ball_control],
                          ['Crossing', result.crossing],
                          ['Curve', result.curve],
                          ['Def. Awareness', result.defensive_awareness],
                          ['Dribbling', result.dribbling],
                          ['FK Accuracy', result.fk_accuracy]
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{label}</span>
                            <span className={`text-sm font-medium ${
                              Number(value) >= 80 ? 'text-green-600' :
                              Number(value) >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Goalkeeper Attributes */}
                    <div className="p-4">
                      <h4 className="font-medium text-green-600 mb-3">Goalkeeper</h4>
                      <div className="space-y-2">
                        {[
                          ['Diving', result.gk_diving],
                          ['Handling', result.gk_handling],
                          ['Kicking', result.gk_kicking],
                          ['Positioning', result.gk_positioning],
                          ['Reflexes', result.gk_reflexes]
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{label}</span>
                            <span className={`text-sm font-medium ${
                              Number(value) >= 80 ? 'text-green-600' :
                              Number(value) >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No test results available.</p>
          )}
        </div>

        {/* Applications Section - Improved card layout */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Applications</h2>
            <span className="text-sm text-gray-600">
              {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
            </span>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{application.club.name}</h3>
                      <p className="text-sm text-gray-600">{application.club.location}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied on {new Date(application.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      application.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                      application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {application.status}
                    </span>
                  </div>

                  {application.feedback && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{application.feedback}</p>
                    </div>
                  )}

                  {application.status === 'Accepted' && !trainee?.final_club_id && (
                    <button
                      onClick={() => handleSelectFinalClub(application.club_id)}
                      className="mt-4 w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Select as Final Club
                    </button>
                  )}

                  {trainee?.final_club_id === application.club_id && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Selected as your final club</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No applications yet.</p>
          )}
        </div>

        {/* Available Clubs Section - Improved grid layout */}
        {trainee?.status === 'Test Completed' && !trainee?.final_club_id && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Available Clubs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club) => {
                const application = applications.find(app => app.club_id === club.cid);
                const isApplying = applyingToClub === club.cid;

                return (
                  <div key={club.cid} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      {club.logo_url && (
                        <img
                          src={club.logo_url}
                          alt={`${club.name} logo`}
                          className="w-12 h-12 object-contain"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{club.name}</h3>
                        <p className="text-sm text-gray-600">{club.location}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{club.description}</p>
                    
                    {application ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            application.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                            application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {application.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Applied {new Date(application.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                        {application.feedback && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">{application.feedback}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApplyToClub(club.cid)}
                        disabled={isApplying}
                        className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
                          isApplying
                            ? 'bg-gray-100 text-gray-500 cursor-wait'
                            : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
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
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-800 mb-2">Final Club Selected</h3>
            <p className="text-sm text-green-700">You have selected your final club. No further applications can be submitted.</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}