'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  trainee_uid: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  submitted_at: string;
  feedback: string | null;
  trainee: {
    name: string;
    birth_date: string;
    preferred_position: string;
  };
  test_result: {
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
  } | null;
}

export default function ClubApplications({ params }: { params: { cid: string } }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [feedback, setFeedback] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 10;
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('club_applications')
        .select(`
          *,
          trainee:trainees(name, birth_date, preferred_position),
          test_result:test_results(*)
        `)
        .eq('club_id', params.cid)
        .order('submitted_at', { ascending: false });

      if (applicationsError) throw applicationsError;
      setApplications(applicationsData || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: 'Accepted' | 'Rejected') => {
    try {
      const { error: updateError } = await supabase
        .from('club_applications')
        .update({
          status: newStatus,
          feedback: feedback || null
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Refresh applications list
      fetchApplications();
      setSelectedApplication(null);
      setFeedback('');
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status');
    }
  };

  const totalPages = Math.ceil(applications.length / applicationsPerPage);
  const startIndex = (currentPage - 1) * applicationsPerPage;
  const endIndex = startIndex + applicationsPerPage;
  const currentApplications = applications.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#000000] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Trainee Applications</h1>

        {/* Applications List */}
        <div className="space-y-4">
          {currentApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg border border-[#E6E6E6] p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{application.trainee.name}</h2>
                  <p className="text-[#555555]">
                    Position: {application.trainee.preferred_position} | 
                    Age: {new Date().getFullYear() - new Date(application.trainee.birth_date).getFullYear()}
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

              {application.status === 'Pending' && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'Rejected')}
                    className="px-4 py-2 bg-[#F44336] text-white rounded-lg hover:bg-[#D32F2F] transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'Accepted')}
                    className="px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B31A] transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => setSelectedApplication(application)}
                    className="px-4 py-2 bg-[#F5F5F5] text-[#000000] rounded-lg hover:bg-[#E6E6E6] transition-colors"
                  >
                    Review Details
                  </button>
                </div>
              )}

              {application.feedback && (
                <div className="mt-4 p-4 bg-[#F5F5F5] rounded-lg">
                  <h3 className="font-semibold mb-2">Feedback:</h3>
                  <p className="text-[#555555]">{application.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-[#E6E6E6] rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-[#E6E6E6] rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Review Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Review Application</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-[#555555] hover:text-[#000000]"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{selectedApplication.trainee.name}</h3>
                <p className="text-[#555555]">
                  Position: {selectedApplication.trainee.preferred_position} | 
                  Age: {new Date().getFullYear() - new Date(selectedApplication.trainee.birth_date).getFullYear()}
                </p>
              </div>

              {selectedApplication.test_result && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#F5F5F5] p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Physical Attributes</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[#555555]">Acceleration:</span>
                        <div className="w-full bg-[#E6E6E6] rounded-full h-2">
                          <div className="bg-[#14D922] h-2 rounded-full" style={{ width: `${selectedApplication.test_result.acceleration}%` }}></div>
                        </div>
                        <span className="text-sm">{selectedApplication.test_result.acceleration}</span>
                      </div>
                      <div>
                        <span className="text-[#555555]">Agility:</span>
                        <div className="w-full bg-[#E6E6E6] rounded-full h-2">
                          <div className="bg-[#14D922] h-2 rounded-full" style={{ width: `${selectedApplication.test_result.agility}%` }}></div>
                        </div>
                        <span className="text-sm">{selectedApplication.test_result.agility}</span>
                      </div>
                      <div>
                        <span className="text-[#555555]">Balance:</span>
                        <div className="w-full bg-[#E6E6E6] rounded-full h-2">
                          <div className="bg-[#14D922] h-2 rounded-full" style={{ width: `${selectedApplication.test_result.balance}%` }}></div>
                        </div>
                        <span className="text-sm">{selectedApplication.test_result.balance}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F5F5F5] p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Mental Attributes</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[#555555]">Aggression:</span>
                        <div className="w-full bg-[#E6E6E6] rounded-full h-2">
                          <div className="bg-[#14D922] h-2 rounded-full" style={{ width: `${selectedApplication.test_result.aggression}%` }}></div>
                        </div>
                        <span className="text-sm">{selectedApplication.test_result.aggression}</span>
                      </div>
                      <div>
                        <span className="text-[#555555]">Composure:</span>
                        <div className="w-full bg-[#E6E6E6] rounded-full h-2">
                          <div className="bg-[#14D922] h-2 rounded-full" style={{ width: `${selectedApplication.test_result.composure}%` }}></div>
                        </div>
                        <span className="text-sm">{selectedApplication.test_result.composure}</span>
                      </div>
                      <div>
                        <span className="text-[#555555]">Vision:</span>
                        <div className="w-full bg-[#E6E6E6] rounded-full h-2">
                          <div className="bg-[#14D922] h-2 rounded-full" style={{ width: `${selectedApplication.test_result.vision}%` }}></div>
                        </div>
                        <span className="text-sm">{selectedApplication.test_result.vision}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F5F5F5] p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Technical Attributes</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[#555555]">Ball Control:</span>
                        <div className="w-full bg-[#E6E6E6] rounded-full h-2">
                          <div className="bg-[#14D922] h-2 rounded-full" style={{ width: `${selectedApplication.test_result.ball_control}%` }}></div>
                        </div>
                        <span className="text-sm">{selectedApplication.test_result.ball_control}</span>
                      </div>
                      <div>
                        <span className="text-[#555555]">Dribbling:</span>
                        <div className="w-full bg-[#E6E6E6] rounded-full h-2">
                          <div className="bg-[#14D922] h-2 rounded-full" style={{ width: `${selectedApplication.test_result.dribbling}%` }}></div>
                        </div>
                        <span className="text-sm">{selectedApplication.test_result.dribbling}</span>
                      </div>
                      <div>
                        <span className="text-[#555555]">Passing:</span>
                        <div className="w-full bg-[#E6E6E6] rounded-full h-2">
                          <div className="bg-[#14D922] h-2 rounded-full" style={{ width: `${(selectedApplication.test_result.short_passing + selectedApplication.test_result.long_passing) / 2}%` }}></div>
                        </div>
                        <span className="text-sm">{(selectedApplication.test_result.short_passing + selectedApplication.test_result.long_passing) / 2}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#555555] mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-2 bg-[#F5F5F5] border border-[#E6E6E6] rounded-lg focus:outline-none focus:border-[#14D922]"
                  rows={4}
                  placeholder="Enter your feedback for the trainee..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleStatusUpdate(selectedApplication.id, 'Rejected')}
                  className="px-4 py-2 bg-[#F44336] text-white rounded-lg hover:bg-[#D32F2F] transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedApplication.id, 'Accepted')}
                  className="px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B31A] transition-colors"
                >
                  Accept
                </button>
              </div>
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
  );
} 
