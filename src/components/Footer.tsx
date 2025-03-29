'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#F0F0F0] text-black py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company Info */}
          <div>
            <img 
              src="/images/saql-transparent2.png" 
              alt="Saql Logo" 
              className="h-16 w-auto mb-4"
            />
            <p className="text-black">
              Revolutionizing soccer talent scouting with innovative technology and comprehensive player evaluation tools.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#14D922] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/team" className="text-black hover:text-[#14D922] transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-black hover:text-[#14D922] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-right">
            <h3 className="text-lg font-semibold text-[#14D922] mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-black">Email: smt4business@gmail.com</li>
              <li className="text-black">Address: Riyadh, Saudi Arabia</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-[#DDDDDD] text-center text-black">
          <p>&copy; {new Date().getFullYear()} Saql. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 