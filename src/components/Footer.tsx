'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#F0F0F0] text-black py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Company Info */}
          <div className="text-center sm:text-left">
            <img 
              src="/images/saql-transparent2.png" 
              alt="Saql Logo" 
              className="h-12 sm:h-16 w-auto mb-4 mx-auto sm:mx-0"
            />
            <p className="text-sm sm:text-base text-black">
              Revolutionizing soccer talent scouting with innovative technology and comprehensive player evaluation tools.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-[#14D922] mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/team" className="text-sm sm:text-base text-black hover:text-[#14D922] transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm sm:text-base text-black hover:text-[#14D922] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-right">
            <h3 className="text-base sm:text-lg font-semibold text-[#14D922] mb-3 sm:mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-sm sm:text-base text-black">Email: smt4business@gmail.com</li>
              <li className="text-sm sm:text-base text-black">Address: Riyadh, Saudi Arabia</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-[#DDDDDD] text-center">
          <p className="text-sm sm:text-base text-black">&copy; {new Date().getFullYear()} Saql. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 