'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Club {
  cid: string;
  name: string;
  location: string;
  description: string;
  logo_url: string;
}

interface Application {
  id: string;
  club_id: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  submitted_at: string;
  feedback: string | null;
}

export default function TraineeClubs() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const clubsPerPage = 10;
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchClubs();
    fetchApplications();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: applicationsData, error: applicationsError } = await supabase
        .from('club_applications')
        .select('*')
        .eq('trainee_uid', user.id);

      if (applicationsError) throw applicationsError;
      setApplications(applicationsData || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    }
  };

  const handleApply = async (clubId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: applyError } = await supabase
        .from('club_applications')
        .insert([
          {
            trainee_uid: user.id,
            club_id: clubId,
            status: 'Pending'
          }
        ]);

      if (applyError) throw applyError;

      // Refresh applications list
      fetchApplications();
    } catch (err) {
      console.error('Error applying to club:', err);
      setError('Failed to apply to club');
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClubs.length / clubsPerPage);
  const startIndex = (currentPage - 1) * clubsPerPage;
  const endIndex = startIndex + clubsPerPage;
  const currentClubs = filteredClubs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const getApplicationStatus = (clubId: string) => {
    const application = applications.find(app => app.club_id === clubId);
    return application?.status || null;
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
        <h1 className="text-3xl font-bold text-black mb-8">Available Clubs</h1>
        
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search clubs by name or location..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 bg-white border border-[#E6E6E6] rounded-lg focus:outline-none focus:border-[#14D922] text-black placeholder-[#555555]"
          />
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentClubs.map((club) => {
            const status = getApplicationStatus(club.cid);
            return (
              <div key={club.cid} className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
                <div className="flex items-center mb-4">
                  {club.logo_url && (
                    <img
                      src={club.logo_url}
                      alt={`${club.name} logo`}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-black">{club.name}</h2>
                    <p className="text-[#555555]">{club.location}</p>
                  </div>
                </div>
                <p className="text-[#555555] mb-4">{club.description}</p>
                <div className="flex justify-between items-center">
                  {status ? (
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      status === 'Accepted' ? 'bg-[#14D922]/20 text-[#14D922]' :
                      status === 'Rejected' ? 'bg-red-500/20 text-red-600' :
                      'bg-yellow-500/20 text-yellow-600'
                    }`}>
                      {status}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(club.cid)}
                      className="px-4 py-2 bg-[#14D922] text-white rounded-lg hover:bg-[#10B61E] transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-[#14D922] text-white'
                    : 'bg-white text-[#555555] border border-[#E6E6E6] hover:bg-[#F5F5F5]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 text-red-400 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 