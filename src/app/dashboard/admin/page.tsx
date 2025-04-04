'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import bcrypt from 'bcryptjs'
import type { Club, Scouter } from '@/types/database'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface AdminStats {
  totalScouters: number
  totalClubs: number
  totalTrainees: number
  pendingTests: number
  completedTests: number
  totalApplications: number
  applications: {
    data: Array<{
      id: string;
      clubName: string;
      status: 'pending' | 'approved' | 'rejected';
      date: string;
    }>;
    total: number;
  };
}

type TabType = 'clubs' | 'scouters' | 'tests';

interface StatCardProps {
  title: string
  value: number
  color: string
  subtitle?: string
}

const StatCard = ({ title, value, color, subtitle }: StatCardProps) => (
  <div className="bg-white rounded-lg p-4 sm:p-6 border border-[#E6E6E6] relative overflow-hidden">
    <div className="relative z-10">
      <p className="text-sm font-medium text-[#555555]">{title}</p>
      <p className="text-2xl sm:text-3xl font-bold text-black mt-2">{value}</p>
      <p className="text-xs sm:text-sm text-[#555555] mt-1">{subtitle}</p>
    </div>
    <div className={`absolute bottom-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-[#14D922]/10 rounded-tl-full`}></div>
  </div>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalScouters: 0,
    totalClubs: 0,
    totalTrainees: 0,
    pendingTests: 0,
    completedTests: 0,
    totalApplications: 0,
    applications: {
      data: [],
      total: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('clubs')
  const [clubs, setClubs] = useState<Club[]>([])
  const [scouters, setScouters] = useState<Scouter[]>([])
  const [newClub, setNewClub] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    phone: '',
    contact_person: '',
    logo_url: '',
    description: ''
  })
  const [newScouter, setNewScouter] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [applicationsPerPage] = useState(5)

  useEffect(() => {
    fetchStats()
    fetchClubs()
    fetchScouters()
    fetchApplications(currentPage)
    // Set up polling every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin-stats')
      if (!response.ok) throw new Error('Failed to fetch admin stats')
      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/clubs')
      if (!response.ok) throw new Error('Failed to fetch clubs')
      const data = await response.json()
      setClubs(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const fetchScouters = async () => {
    try {
      const response = await fetch('/api/scouters')
      if (!response.ok) throw new Error('Failed to fetch scouters')
      const data = await response.json()
      setScouters(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const fetchApplications = async (page: number) => {
    try {
      const response = await fetch(`/api/club-applications?page=${page}&limit=${applicationsPerPage}`)
      if (!response.ok) throw new Error('Failed to fetch applications')
      const data = await response.json()
      setStats(prevStats => ({
        ...prevStats,
        applications: data
      }))
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchApplications(currentPage)
  }, [currentPage])

  const totalPages = Math.ceil(stats.applications.total / applicationsPerPage)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleClubSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const hashedPassword = await bcrypt.hash(newClub.password, 10)
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newClub,
          password: hashedPassword
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create club')
      }

      setSuccess('Club created successfully')
      setNewClub({
        name: '',
        email: '',
        password: '',
        location: '',
        phone: '',
        contact_person: '',
        logo_url: '',
        description: ''
      })
      fetchClubs()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleScouterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const hashedPassword = await bcrypt.hash(newScouter.password, 10)
      const response = await fetch('/api/scouters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newScouter,
          password: hashedPassword
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create scouter')
      }

      setSuccess('Scouter created successfully')
      setNewScouter({
        name: '',
        email: '',
        password: ''
      })
      fetchScouters()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteClub = async (cid: string) => {
    if (!confirm('Are you sure you want to delete this club?')) return

    try {
      const response = await fetch(`/api/clubs/${cid}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete club')
      }

      setSuccess('Club deleted successfully')
      fetchClubs()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteScouter = async (sid: string) => {
    if (!confirm('Are you sure you want to delete this scouter?')) return

    try {
      const response = await fetch(`/api/scouters/${sid}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete scouter')
      }

      setSuccess('Scouter deleted successfully')
      fetchScouters()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5DD62C]"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-full overflow-hidden">
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          <h1 className="text-xl sm:text-3xl font-bold text-black">Admin Dashboard</h1>

          {/* Stats Grid - 2 columns on mobile, 3 on larger screens */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <StatCard 
              title="Total Scouters" 
              value={stats.totalScouters} 
              color="blue"
              subtitle="Active Scouters" 
            />
            <StatCard 
              title="Total Clubs" 
              value={stats.totalClubs} 
              color="green"
              subtitle="Registered Clubs" 
            />
            <StatCard 
              title="Total Trainees" 
              value={stats.totalTrainees} 
              color="yellow"
              subtitle="Registered Trainees" 
            />
            <StatCard 
              title="Pending Tests" 
              value={stats.pendingTests} 
              color="orange"
              subtitle="Awaiting Assessment" 
            />
            <StatCard 
              title="Completed Tests" 
              value={stats.completedTests} 
              color="green"
              subtitle="Test Results Available" 
            />
            <StatCard 
              title="Club Applications" 
              value={stats.totalApplications} 
              color="purple"
              subtitle="Total Applications" 
            />
          </div>

          {/* Tabs - Full width on mobile */}
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-3 sm:p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActiveTab('clubs')}
                className={`flex-1 sm:flex-none px-3 py-2 rounded-lg transition-colors text-sm ${
                  activeTab === 'clubs'
                    ? 'bg-[#14D922] text-white'
                    : 'text-[#555555] hover:bg-gray-100'
                }`}
              >
                Clubs
              </button>
              <button
                onClick={() => setActiveTab('scouters')}
                className={`flex-1 sm:flex-none px-3 py-2 rounded-lg transition-colors text-sm ${
                  activeTab === 'scouters'
                    ? 'bg-[#14D922] text-white'
                    : 'text-[#555555] hover:bg-gray-100'
                }`}
              >
                Scouters
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`flex-1 sm:flex-none px-3 py-2 rounded-lg transition-colors text-sm ${
                  activeTab === 'tests'
                    ? 'bg-[#14D922] text-white'
                    : 'text-[#555555] hover:bg-gray-100'
                }`}
              >
                Test Results
              </button>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Content based on active tab */}
            <div className="bg-white rounded-lg p-3 sm:p-6 border border-[#E6E6E6]">
              {activeTab === 'clubs' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Add Club Form */}
                  <div className="bg-white rounded-lg p-3 sm:p-6 border border-[#E6E6E6]">
                    <h2 className="text-lg sm:text-xl font-semibold text-black mb-4">Add New Club</h2>
                    <form onSubmit={handleClubSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Name</label>
                        <input
                          type="text"
                          value={newClub.name}
                          onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Email</label>
                        <input
                          type="email"
                          value={newClub.email}
                          onChange={(e) => setNewClub({ ...newClub, email: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Password</label>
                        <input
                          type="password"
                          value={newClub.password}
                          onChange={(e) => setNewClub({ ...newClub, password: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Location</label>
                        <input
                          type="text"
                          value={newClub.location}
                          onChange={(e) => setNewClub({ ...newClub, location: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Phone</label>
                        <input
                          type="tel"
                          value={newClub.phone}
                          onChange={(e) => setNewClub({ ...newClub, phone: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Contact Person</label>
                        <input
                          type="text"
                          value={newClub.contact_person}
                          onChange={(e) => setNewClub({ ...newClub, contact_person: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Logo URL</label>
                        <input
                          type="url"
                          value={newClub.logo_url}
                          onChange={(e) => setNewClub({ ...newClub, logo_url: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black text-sm"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-[#555555] mb-1">Description</label>
                        <textarea
                          value={newClub.description}
                          onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black text-sm"
                          rows={3}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="submit"
                          className="w-full bg-[#14D922] text-white py-2 px-4 rounded-md hover:bg-[#10B61E] transition-colors text-sm sm:text-base"
                        >
                          Add Club
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Recent Applications with Pagination */}
                  <div className="bg-white rounded-lg p-3 sm:p-6 border border-[#E6E6E6]">
                    <h2 className="text-lg sm:text-xl font-semibold text-black mb-4">Recent Applications</h2>
                    
                    {/* Mobile Card View */}
                    <div className="block sm:hidden space-y-3">
                      {stats.applications.data.map((application) => (
                        <div key={application.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-black">{application.clubName}</h3>
                              <p className="text-xs text-[#555555] mt-1">
                                {new Date(application.date).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              application.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block">
                      <table className="min-w-full divide-y divide-[#E6E6E6]">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">Club Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E6E6E6]">
                          {stats.applications.data.map((application) => (
                            <tr key={application.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{application.clubName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#555555]">
                                {new Date(application.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  application.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="mt-4 flex items-center justify-between border-t border-[#E6E6E6] px-4 py-3 sm:px-6">
                        <div className="flex flex-1 justify-between sm:hidden">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                              currentPage === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-[#555555] hover:bg-gray-50'
                            }`}
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                              currentPage === totalPages
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-[#555555] hover:bg-gray-50'
                            }`}
                          >
                            Next
                          </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-[#555555]">
                              Showing <span className="font-medium">{(currentPage - 1) * applicationsPerPage + 1}</span> to{' '}
                              <span className="font-medium">
                                {Math.min(currentPage * applicationsPerPage, stats.applications.total)}
                              </span>{' '}
                              of <span className="font-medium">{stats.applications.total}</span> results
                            </p>
                          </div>
                          <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                              <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                                  currentPage === 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-[#555555] hover:bg-gray-50'
                                }`}
                              >
                                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                              {[...Array(totalPages)].map((_, index) => (
                                <button
                                  key={index + 1}
                                  onClick={() => handlePageChange(index + 1)}
                                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                    currentPage === index + 1
                                      ? 'bg-[#14D922] text-white'
                                      : 'text-[#555555] hover:bg-gray-50'
                                  }`}
                                >
                                  {index + 1}
                                </button>
                              ))}
                              <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                                  currentPage === totalPages
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-[#555555] hover:bg-gray-50'
                                }`}
                              >
                                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clubs List - Card view on mobile, table on desktop */}
                  <div className="bg-white rounded-lg p-3 sm:p-6 border border-[#E6E6E6]">
                    <h2 className="text-lg sm:text-xl font-semibold text-black mb-4">Clubs</h2>
                    
                    {/* Mobile Card View */}
                    <div className="block sm:hidden space-y-3">
                      {clubs.map((club) => (
                        <div key={club.cid} className="bg-gray-50 p-3 rounded-lg">
                          <div className="mb-2">
                            <h3 className="font-medium text-black">{club.name}</h3>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-[#555555]">{club.email}</p>
                            <p className="text-[#555555]">{club.location}</p>
                            <div className="mt-2">
                              <p className="font-medium">{club.contact_person}</p>
                              <p className="text-xs text-[#555555]">{club.phone}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#E6E6E6]">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">Contact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E6E6E6]">
                          {clubs.map((club) => (
                            <tr key={club.cid} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{club.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#555555]">{club.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#555555]">{club.location}</td>
                              <td className="px-6 py-4 text-sm text-[#555555]">
                                <div>{club.contact_person}</div>
                                <div className="text-xs mt-1">{club.phone}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'scouters' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Add Scouter Form */}
                  <div className="bg-white rounded-lg p-3 sm:p-6 border border-[#E6E6E6]">
                    <h2 className="text-lg sm:text-xl font-semibold text-black mb-4">Add New Scouter</h2>
                    <form onSubmit={handleScouterSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Name</label>
                        <input
                          type="text"
                          value={newScouter.name}
                          onChange={(e) => setNewScouter({ ...newScouter, name: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Email</label>
                        <input
                          type="email"
                          value={newScouter.email}
                          onChange={(e) => setNewScouter({ ...newScouter, email: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Password</label>
                        <input
                          type="password"
                          value={newScouter.password}
                          onChange={(e) => setNewScouter({ ...newScouter, password: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black text-sm"
                          required
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <button
                          type="submit"
                          className="w-full bg-[#14D922] text-white py-2 px-4 rounded-md hover:bg-[#10B61E] transition-colors text-sm sm:text-base"
                        >
                          Add Scouter
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Scouters List - Card view on mobile, table on desktop */}
                  <div className="bg-white rounded-lg p-3 sm:p-6 border border-[#E6E6E6]">
                    <h2 className="text-lg sm:text-xl font-semibold text-black mb-4">Scouters</h2>
                    
                    {/* Mobile Card View */}
                    <div className="block sm:hidden space-y-3">
                      {scouters.map((scouter) => (
                        <div key={scouter.sid} className="bg-gray-50 p-3 rounded-lg">
                          <div>
                            <h3 className="font-medium text-black">{scouter.name}</h3>
                            <p className="text-sm text-[#555555] mt-1">{scouter.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#E6E6E6]">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E6E6E6]">
                          {scouters.map((scouter) => (
                            <tr key={scouter.sid} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{scouter.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#555555]">{scouter.email}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tests' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-black mb-4">Test Results Overview</h2>
                  <div className="bg-white rounded-lg p-3 sm:p-6 border border-[#E6E6E6]">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-medium text-black">Testing Progress</h3>
                        <p className="text-sm text-[#555555]">Overview of trainee assessments</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#14D922]">
                          {Math.round((stats.completedTests / (stats.pendingTests + stats.completedTests || 1)) * 100)}%
                        </p>
                        <p className="text-sm text-[#555555]">Completion Rate</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm text-[#555555] mb-2">
                          <span>Pending Tests</span>
                          <span>{stats.pendingTests}</span>
                        </div>
                        <div className="h-2 bg-[#E6E6E6] rounded-full">
                          <div 
                            className="h-2 bg-[#FFA500] rounded-full" 
                            style={{ width: `${(stats.pendingTests / (stats.pendingTests + stats.completedTests || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm text-[#555555] mb-2">
                          <span>Completed Tests</span>
                          <span>{stats.completedTests}</span>
                        </div>
                        <div className="h-2 bg-[#E6E6E6] rounded-full">
                          <div 
                            className="h-2 bg-[#14D922] rounded-full" 
                            style={{ width: `${(stats.completedTests / (stats.pendingTests + stats.completedTests || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 