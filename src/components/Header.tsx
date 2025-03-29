'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  return (
    <header className="bg-[#FFFFFF] text-[#000000] border-b border-[#DDDDDD]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center -ml-12">
            <img 
              src="/images/saql-transparent2.png" 
              alt="Saql Logo" 
              className="h-24 w-auto"
            />
          </Link>

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

          <div className="flex items-center space-x-4">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-[#000000] hover:text-[#14D922] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden md:inline">{session.user?.name || 'Profile'}</span>
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
                      href="/dashboard"
                      className="block px-4 py-2 text-[#000000] hover:bg-[#F5F5F5] hover:text-[#14D922] transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setIsDropdownOpen(false)
                      }}
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
                  href="/register"
                  className="px-4 py-2 bg-[#14D922] text-white rounded-lg font-semibold hover:bg-[#10B61E] transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 