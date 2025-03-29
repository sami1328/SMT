'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import bcrypt from 'bcryptjs'
import type { Club, Scouter } from '@/types/database'

interface AdminStats {
  totalScouters: number
  totalClubs: number
  totalTrainees: number
  pendingTests: number
  completedTests: number
  totalApplications: number
}

type TabType = 'clubs' | 'scouters' | 'tests';

interface StatCardProps {
  title: string
  value: number
  color: string
  subtitle?: string
}

const StatCard = ({ title, value, color, subtitle }: StatCardProps) => (
  <div className="bg-white rounded-lg p-6 border border-[#E6E6E6] relative overflow-hidden">
    <div className="relative z-10">
      <p className="text-sm font-medium text-[#555555]">{title}</p>
      <p className="text-3xl font-bold text-black mt-2">{value}</p>
      <p className="text-sm text-[#555555] mt-1">{subtitle}</p>
    </div>
    <div className={`absolute bottom-0 right-0 w-24 h-24 bg-[#14D922]/10 rounded-tl-full`}></div>
  </div>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalScouters: 0,
    totalClubs: 0,
    totalTrainees: 0,
    pendingTests: 0,
    completedTests: 0,
    totalApplications: 0
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

  useEffect(() => {
    fetchStats()
    fetchClubs()
    fetchScouters()
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
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
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

          {/* Tabs */}
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-4">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setActiveTab('clubs')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'clubs'
                    ? 'bg-[#14D922] text-white'
                    : 'text-[#555555] hover:bg-gray-100'
                }`}
              >
                Clubs
              </button>
              <button
                onClick={() => setActiveTab('scouters')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'scouters'
                    ? 'bg-[#14D922] text-white'
                    : 'text-[#555555] hover:bg-gray-100'
                }`}
              >
                Scouters
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`px-4 py-2 rounded-lg transition-colors ${
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
              <div className="mb-4 p-4 bg-red-900 text-red-100 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-900 text-green-100 rounded-lg">
                {success}
              </div>
            )}

            {/* Content based on active tab */}
            <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
              {activeTab === 'clubs' && (
                <div className="space-y-6">
                  {/* Add Club Form */}
                  <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
                    <h2 className="text-xl font-semibold text-black mb-4">Add New Club</h2>
                    <form onSubmit={handleClubSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Name</label>
                        <input
                          type="text"
                          value={newClub.name}
                          onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Email</label>
                        <input
                          type="email"
                          value={newClub.email}
                          onChange={(e) => setNewClub({ ...newClub, email: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Password</label>
                        <input
                          type="password"
                          value={newClub.password}
                          onChange={(e) => setNewClub({ ...newClub, password: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Location</label>
                        <input
                          type="text"
                          value={newClub.location}
                          onChange={(e) => setNewClub({ ...newClub, location: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Phone</label>
                        <input
                          type="tel"
                          value={newClub.phone}
                          onChange={(e) => setNewClub({ ...newClub, phone: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Contact Person</label>
                        <input
                          type="text"
                          value={newClub.contact_person}
                          onChange={(e) => setNewClub({ ...newClub, contact_person: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Logo URL</label>
                        <input
                          type="url"
                          value={newClub.logo_url}
                          onChange={(e) => setNewClub({ ...newClub, logo_url: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#555555] mb-1">Description</label>
                        <textarea
                          value={newClub.description}
                          onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black"
                          rows={3}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          className="w-full bg-[#14D922] text-white py-2 px-4 rounded-md hover:bg-[#10B61E] transition-colors"
                        >
                          Add Club
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Clubs List */}
                  <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
                    <h2 className="text-xl font-semibold text-black mb-4">Clubs</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#E6E6E6]">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider w-1/4">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider w-1/4">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider w-1/4">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider w-1/4">Contact</th>
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
                <div className="space-y-6">
                  {/* Add Scouter Form */}
                  <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
                    <h2 className="text-xl font-semibold text-black mb-4">Add New Scouter</h2>
                    <form onSubmit={handleScouterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Name</label>
                        <input
                          type="text"
                          value={newScouter.name}
                          onChange={(e) => setNewScouter({ ...newScouter, name: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Email</label>
                        <input
                          type="email"
                          value={newScouter.email}
                          onChange={(e) => setNewScouter({ ...newScouter, email: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#555555] mb-1">Password</label>
                        <input
                          type="password"
                          value={newScouter.password}
                          onChange={(e) => setNewScouter({ ...newScouter, password: e.target.value })}
                          className="w-full bg-white border border-[#E6E6E6] rounded-md px-3 py-2 text-black"
                          required
                        />
                      </div>
                      <div className="md:col-span-3">
                        <button
                          type="submit"
                          className="w-full bg-[#14D922] text-white py-2 px-4 rounded-md hover:bg-[#10B61E] transition-colors"
                        >
                          Add Scouter
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Scouters List */}
                  <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
                    <h2 className="text-xl font-semibold text-black mb-4">Scouters</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#E6E6E6]">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider w-1/2">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider w-1/2">Email</th>
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
                <div>
                  <h2 className="text-xl font-semibold text-black mb-4">Test Results Overview</h2>
                  <div className="bg-white rounded-lg p-6 border border-[#E6E6E6]">
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