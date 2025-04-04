'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsDropdownOpen(false)
    router.push('/')
  }

  const getDashboardPath = () => {
    if (!user) return '/dashboard'
    
    switch (user.role) {
      case 'admin':
        return '/dashboard/admin'
      case 'scouter':
        return `/dashboard/scouter/${user.id}`
      case 'club':
        return `/dashboard/club/${user.id}`
      case 'trainee':
        return `/dashboard/trainee/${user.id}`
      default:
        return '/dashboard'
    }
  }

  return (
    <header className="bg-[#FFFFFF] text-[#000000] border-b border-[#DDDDDD]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <img 
              src="/images/saql-transparent2.png" 
              alt="Saql Logo" 
              className="h-16 sm:h-20 w-auto"
            />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center space-x-12">
            <Link
              href="/"
              className={`text-[#000000] hover:text-[#14D922] transition-colors text-lg font-medium ${
                isActive('/') ? 'text-[#14D922]' : ''
              }`}
            >
              Home
            </Link>
            <Link
              href="/team"
              className={`text-[#000000] hover:text-[#14D922] transition-colors text-lg font-medium ${
                isActive('/team') ? 'text-[#14D922]' : ''
              }`}
            >
              Team
            </Link>
            <Link
              href="/contact"
              className={`text-[#000000] hover:text-[#14D922] transition-colors text-lg font-medium ${
                isActive('/contact') ? 'text-[#14D922]' : ''
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-[#000000] hover:text-[#14D922] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{user.name}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] rounded-lg shadow-lg py-2 z-50 border border-[#DDDDDD]">
                    <Link
                      href={getDashboardPath()}
                      className="block px-4 py-2 text-[#000000] hover:bg-[#F5F5F5] hover:text-[#14D922] transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-[#000000] hover:bg-[#F5F5F5] hover:text-[#14D922] transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-[#000000] hover:text-[#14D922] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-[#14D922] text-white rounded-lg font-semibold hover:bg-[#10B61E] transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[#DDDDDD]">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`text-[#000000] hover:text-[#14D922] transition-colors text-lg font-medium ${
                  isActive('/') ? 'text-[#14D922]' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/team"
                className={`text-[#000000] hover:text-[#14D922] transition-colors text-lg font-medium ${
                  isActive('/team') ? 'text-[#14D922]' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Team
              </Link>
              <Link
                href="/contact"
                className={`text-[#000000] hover:text-[#14D922] transition-colors text-lg font-medium ${
                  isActive('/contact') ? 'text-[#14D922]' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-[#DDDDDD]">
                {user ? (
                  <>
                    <Link
                      href={getDashboardPath()}
                      className="block w-full text-center py-2 text-[#000000] hover:text-[#14D922] transition-colors text-lg font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full text-center py-2 text-[#000000] hover:text-[#14D922] transition-colors text-lg font-medium"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block w-full text-center py-2 text-[#000000] hover:text-[#14D922] transition-colors text-lg font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="block w-full text-center py-2 bg-[#14D922] text-white rounded-lg font-semibold hover:bg-[#10B61E] transition-colors text-lg font-medium mt-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
} 