'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Trainee {
  tid: string;
  name: string;
  status: string;
  birth_date: string;
}

interface TestResult {
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
  notes_TR: string;
}

export default function ScouterDashboard({ params }: { params: { sid: string } }) {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [showTestForm, setShowTestForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const traineesPerPage = 10;
  const [testForm, setTestForm] = useState<TestResult>({
    acceleration: 50,
    agility: 50,
    balance: 50,
    jumping: 50,
    reactions: 50,
    sprint_speed: 50,
    stamina: 50,
    strength: 50,
    aggression: 50,
    att_position: 50,
    composure: 50,
    interceptions: 50,
    vision: 50,
    ball_control: 50,
    crossing: 50,
    curve: 50,
    defensive_awareness: 50,
    dribbling: 50,
    fk_accuracy: 50,
    finishing: 50,
    heading_accuracy: 50,
    long_passing: 50,
    long_shots: 50,
    penalties: 50,
    short_passing: 50,
    shot_power: 50,
    sliding_tackle: 50,
    standing_tackle: 50,
    volleys: 50,
    gk_diving: 50,
    gk_handling: 50,
    gk_kicking: 50,
    gk_positioning: 50,
    gk_reflexes: 50,
    notes_TR: '',
  });

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchTrainees();
  }, []);

  const fetchTrainees = async () => {
    try {
      const { data, error } = await supabase
        .from('trainees')
        .select('*')
        .order('name');

      if (error) throw error;
      setTrainees(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching trainees');
    } finally {
      setLoading(false);
    }
  };

  // Filter trainees based on search query, status, and age
  const filteredTrainees = trainees.filter(trainee => {
    const matchesSearch = trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         trainee.tid.slice(0, 8).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trainee.status === statusFilter;
    
    // Calculate age from birth_date
    const birthDate = new Date(trainee.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    const matchesAge = ageFilter === 'all' || 
      (ageFilter === 'under18' && age < 18) ||
      (ageFilter === '18to25' && age >= 18 && age <= 25) ||
      (ageFilter === 'over25' && age > 25);
    
    return matchesSearch && matchesStatus && matchesAge;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredTrainees.length / traineesPerPage);
  const startIndex = (currentPage - 1) * traineesPerPage;
  const endIndex = startIndex + traineesPerPage;
  const currentTrainees = filteredTrainees.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter changes
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleAgeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAgeFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSubmitTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainee) return;

    try {
      console.log('Submitting test for trainee:', selectedTrainee.tid);
      console.log('Test form data:', testForm);

      // Insert test result with all attributes
      const { data: testData, error: testError } = await supabase
        .from('test_results')
        .insert([
          {
            tid: selectedTrainee.tid,
            submitted_by: params.sid,
            acceleration: testForm.acceleration,
            agility: testForm.agility,
            balance: testForm.balance,
            jumping: testForm.jumping,
            reactions: testForm.reactions,
            sprint_speed: testForm.sprint_speed,
            stamina: testForm.stamina,
            strength: testForm.strength,
            aggression: testForm.aggression,
            att_position: testForm.att_position,
            composure: testForm.composure,
            interceptions: testForm.interceptions,
            vision: testForm.vision,
            ball_control: testForm.ball_control,
            crossing: testForm.crossing,
            curve: testForm.curve,
            defensive_awareness: testForm.defensive_awareness,
            dribbling: testForm.dribbling,
            fk_accuracy: testForm.fk_accuracy,
            finishing: testForm.finishing,
            heading_accuracy: testForm.heading_accuracy,
            long_passing: testForm.long_passing,
            long_shots: testForm.long_shots,
            penalties: testForm.penalties,
            short_passing: testForm.short_passing,
            shot_power: testForm.shot_power,
            sliding_tackle: testForm.sliding_tackle,
            standing_tackle: testForm.standing_tackle,
            volleys: testForm.volleys,
            gk_diving: testForm.gk_diving,
            gk_handling: testForm.gk_handling,
            gk_kicking: testForm.gk_kicking,
            gk_positioning: testForm.gk_positioning,
            gk_reflexes: testForm.gk_reflexes,
            notes_TR: testForm.notes_TR,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (testError) {
        console.error('Error inserting test result:', testError);
        throw new Error(`Failed to insert test result: ${testError.message}`);
      }

      console.log('Test result inserted successfully:', testData);

      // Update trainee status to Test Completed
      const { error: updateError } = await supabase
        .from('trainees')
        .update({ status: 'Test Completed' })
        .eq('tid', selectedTrainee.tid);

      if (updateError) {
        console.error('Error updating trainee status:', updateError);
        throw new Error(`Failed to update trainee status: ${updateError.message}`);
      }

      // Refresh trainees list
      await fetchTrainees();
      
      // Close form and reset
      setShowTestForm(false);
      setSelectedTrainee(null);
      setTestForm({
        acceleration: 50,
        agility: 50,
        balance: 50,
        jumping: 50,
        reactions: 50,
        sprint_speed: 50,
        stamina: 50,
        strength: 50,
        aggression: 50,
        att_position: 50,
        composure: 50,
        interceptions: 50,
        vision: 50,
        ball_control: 50,
        crossing: 50,
        curve: 50,
        defensive_awareness: 50,
        dribbling: 50,
        fk_accuracy: 50,
        finishing: 50,
        heading_accuracy: 50,
        long_passing: 50,
        long_shots: 50,
        penalties: 50,
        short_passing: 50,
        shot_power: 50,
        sliding_tackle: 50,
        standing_tackle: 50,
        volleys: 50,
        gk_diving: 50,
        gk_handling: 50,
        gk_kicking: 50,
        gk_positioning: 50,
        gk_reflexes: 50,
        notes_TR: '',
      });
    } catch (err) {
      console.error('Error submitting test:', err);
      setError(err instanceof Error ? err.message : 'Error submitting test');
    }
  };

  const stats = {
    total: trainees.length,
    pending: trainees.filter(t => t.status === 'Pending Test').length,
    completed: trainees.filter(t => t.status === 'Test Completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Scouter Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
            <h3 className="text-lg font-medium text-[#555555]">Total Trainees</h3>
            <p className="text-3xl font-bold text-black">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
            <h3 className="text-lg font-medium text-[#555555]">Pending Tests</h3>
            <p className="text-3xl font-bold text-black">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
            <h3 className="text-lg font-medium text-[#555555]">Completed Tests</h3>
            <p className="text-3xl font-bold text-black">{stats.completed}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Search trainees by name or ID..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 rounded-lg bg-white text-black border border-[#E6E6E6] focus:outline-none focus:border-[#14D922]"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-[#555555] mb-1">
                Status Filter
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full px-4 py-2 rounded-lg bg-white text-black border border-[#E6E6E6] focus:outline-none focus:border-[#14D922]"
              >
                <option value="all">All Status</option>
                <option value="Pending Test">Pending Test</option>
                <option value="Test Completed">Test Completed</option>
              </select>
            </div>
            <div>
              <label htmlFor="ageFilter" className="block text-sm font-medium text-[#555555] mb-1">
                Age Filter
              </label>
              <select
                id="ageFilter"
                value={ageFilter}
                onChange={handleAgeFilterChange}
                className="w-full px-4 py-2 rounded-lg bg-white text-black border border-[#E6E6E6] focus:outline-none focus:border-[#14D922]"
              >
                <option value="all">All Ages</option>
                <option value="under18">Under 18</option>
                <option value="18to25">18-25</option>
                <option value="over25">Over 25</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trainees Table */}
        <div className="bg-white rounded-lg shadow border border-[#E6E6E6] overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E6E6E6]">
              <thead className="bg-white">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider bg-white">
                    ID
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider bg-white">
                    Name
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider bg-white">
                    Age
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider bg-white">
                    Status
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider bg-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E6E6E6]">
                {currentTrainees.map((trainee) => (
                  <tr key={trainee.tid} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-[#555555]">
                      {trainee.tid.slice(0, 8)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-black">
                      {trainee.name}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-[#555555]">
                      {Math.floor((new Date().getTime() - new Date(trainee.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25))}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                        trainee.status === 'Test Completed' ? 'bg-[#14D922]/20 text-[#14D922]' :
                        trainee.status === 'Test Failed' ? 'bg-red-500/20 text-red-600' :
                        'bg-yellow-500/20 text-yellow-600'
                      }`}>
                        {trainee.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                      {trainee.status === 'Pending Test' ? (
                        <button
                          onClick={() => {
                            setSelectedTrainee(trainee);
                            setShowTestForm(true);
                          }}
                          className="text-[#14D922] hover:text-[#10B61E] transition-colors"
                        >
                          Take Test
                        </button>
                      ) : trainee.status === 'Test Completed' ? (
                        <button
                          onClick={() => router.push(`/dashboard/scouter/${params.sid}/trainee/${trainee.tid}/results`)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View Results
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-white bg-[#14D922] rounded-md hover:bg-[#10B61E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === page
                      ? 'bg-[#14D922] text-white'
                      : 'bg-white text-[#555555] border border-[#E6E6E6] hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-white bg-[#14D922] rounded-md hover:bg-[#10B61E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Test Form Modal */}
        {showTestForm && selectedTrainee && (
          <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white w-full sm:rounded-lg shadow-xl sm:max-w-6xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white p-4 sm:p-6 border-b border-[#E6E6E6]">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-black">
                    Test Form - {selectedTrainee.name}
                  </h2>
                  <button
                    onClick={() => {
                      setShowTestForm(false);
                      setSelectedTrainee(null);
                    }}
                    className="p-2 -mr-2 text-[#555555] hover:text-black transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmitTest} className="p-4 sm:p-6">
                {/* Physical Attributes */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-medium text-black mb-4">Physical Attributes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {[
                      { key: 'acceleration', label: 'Acceleration' },
                      { key: 'agility', label: 'Agility' },
                      { key: 'balance', label: 'Balance' },
                      { key: 'jumping', label: 'Jumping' },
                      { key: 'reactions', label: 'Reactions' },
                      { key: 'sprint_speed', label: 'Sprint Speed' },
                      { key: 'stamina', label: 'Stamina' },
                      { key: 'strength', label: 'Strength' }
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2 bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-[#555555]">
                            {label}
                          </label>
                          <span className="text-sm text-black font-medium bg-white px-2 py-1 rounded">
                            {testForm[key as keyof TestResult]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-[#555555] min-w-[16px]">1</span>
                          <input
                            type="range"
                            min="1"
                            max="99"
                            required
                            value={testForm[key as keyof TestResult]}
                            onChange={(e) =>
                              setTestForm({
                                ...testForm,
                                [key]: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#14D922]"
                          />
                          <span className="text-xs text-[#555555] min-w-[16px]">99</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mental Attributes */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-medium text-black mb-4">Mental Attributes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {[
                      { key: 'aggression', label: 'Aggression' },
                      { key: 'att_position', label: 'Attacking Position' },
                      { key: 'composure', label: 'Composure' },
                      { key: 'interceptions', label: 'Interceptions' },
                      { key: 'vision', label: 'Vision' }
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2 bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-[#555555]">
                            {label}
                          </label>
                          <span className="text-sm text-black font-medium bg-white px-2 py-1 rounded">
                            {testForm[key as keyof TestResult]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-[#555555] min-w-[16px]">1</span>
                          <input
                            type="range"
                            min="1"
                            max="99"
                            required
                            value={testForm[key as keyof TestResult]}
                            onChange={(e) =>
                              setTestForm({
                                ...testForm,
                                [key]: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#14D922]"
                          />
                          <span className="text-xs text-[#555555] min-w-[16px]">99</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Attributes */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-medium text-black mb-4">Technical Attributes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {[
                      { key: 'ball_control', label: 'Ball Control' },
                      { key: 'crossing', label: 'Crossing' },
                      { key: 'curve', label: 'Curve' },
                      { key: 'defensive_awareness', label: 'Defensive Awareness' },
                      { key: 'dribbling', label: 'Dribbling' },
                      { key: 'fk_accuracy', label: 'Free Kick Accuracy' },
                      { key: 'finishing', label: 'Finishing' },
                      { key: 'heading_accuracy', label: 'Heading Accuracy' },
                      { key: 'long_passing', label: 'Long Passing' },
                      { key: 'long_shots', label: 'Long Shots' },
                      { key: 'penalties', label: 'Penalties' },
                      { key: 'short_passing', label: 'Short Passing' },
                      { key: 'shot_power', label: 'Shot Power' },
                      { key: 'sliding_tackle', label: 'Sliding Tackle' },
                      { key: 'standing_tackle', label: 'Standing Tackle' },
                      { key: 'volleys', label: 'Volleys' }
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2 bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-[#555555]">
                            {label}
                          </label>
                          <span className="text-sm text-black font-medium bg-white px-2 py-1 rounded">
                            {testForm[key as keyof TestResult]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-[#555555] min-w-[16px]">1</span>
                          <input
                            type="range"
                            min="1"
                            max="99"
                            required
                            value={testForm[key as keyof TestResult]}
                            onChange={(e) =>
                              setTestForm({
                                ...testForm,
                                [key]: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#14D922]"
                          />
                          <span className="text-xs text-[#555555] min-w-[16px]">99</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goalkeeper Attributes */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-medium text-black mb-4">Goalkeeper Attributes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {[
                      { key: 'gk_diving', label: 'Diving' },
                      { key: 'gk_handling', label: 'Handling' },
                      { key: 'gk_kicking', label: 'Kicking' },
                      { key: 'gk_positioning', label: 'Positioning' },
                      { key: 'gk_reflexes', label: 'Reflexes' }
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2 bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-[#555555]">
                            {label}
                          </label>
                          <span className="text-sm text-black font-medium bg-white px-2 py-1 rounded">
                            {testForm[key as keyof TestResult]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-[#555555] min-w-[16px]">1</span>
                          <input
                            type="range"
                            min="1"
                            max="99"
                            required
                            value={testForm[key as keyof TestResult]}
                            onChange={(e) =>
                              setTestForm({
                                ...testForm,
                                [key]: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#14D922]"
                          />
                          <span className="text-xs text-[#555555] min-w-[16px]">99</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-medium text-black mb-4">Additional Notes</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <textarea
                      value={testForm.notes_TR}
                      onChange={(e) => setTestForm({ ...testForm, notes_TR: e.target.value })}
                      placeholder="Enter any additional notes or observations about the trainee..."
                      className="w-full h-32 px-3 py-2 text-sm text-black bg-white border border-[#E6E6E6] rounded-lg focus:outline-none focus:border-[#14D922] resize-none"
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-[#E6E6E6] p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTestForm(false);
                      setSelectedTrainee(null);
                    }}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-[#555555] bg-white border border-[#E6E6E6] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-white bg-[#14D922] rounded-lg hover:bg-[#10B61E] transition-colors"
                  >
                    Submit Test
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 