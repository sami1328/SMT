'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      {/* Hero Section */}
      <section 
        className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-[#000000] relative"
        style={{
          backgroundImage: 'url("/images/SX-hero-bg-img.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-white">
            Welcome to Saql
          </h1>
          <p className="text-xl sm:text-2xl mb-12 text-white">
            Revolutionizing soccer talent discovery and development through advanced analytics and professional scouting
          </p>
          
          {/* Quick Access Dashboard Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <Link 
              href="/access/trainee"
              className="bg-[#14D922] hover:bg-[#10B61E] text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Trainee Dashboard
            </Link>
            <Link 
              href="/access/club"
              className="bg-[#14D922] hover:bg-[#10B61E] text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Club Dashboard
            </Link>
            <Link 
              href="/scouter-access"
              className="bg-[#14D922] hover:bg-[#10B61E] text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Scout Dashboard
            </Link>
            <Link 
              href="/dashboard/admin"
              className="bg-[#14D922] hover:bg-[#10B61E] text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-[#000000]">
            About Saql
          </h2>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <p className="text-lg text-[#555555] mb-8">
              Saql is a comprehensive platform that bridges the gap between talented players, professional scouts, and football clubs. Our mission is to revolutionize how soccer talent is discovered, evaluated, and developed through cutting-edge technology and expert insights.
            </p>
            <p className="text-lg text-[#555555]">
              Whether you're a young player looking to showcase your skills, a scout searching for the next big talent, or a club aiming to strengthen your roster, Saql provides the tools and connections you need to succeed in the modern football landscape.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 text-[#000000]">Precision</h3>
              <p className="text-[#555555]">
                Advanced analytics and evaluation tools for accurate talent assessment, powered by data-driven insights and professional standards
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 text-[#000000]">Efficiency</h3>
              <p className="text-[#555555]">
                Streamlined scouting process and data management, making talent discovery and evaluation faster and more effective
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 text-[#000000]">Excellence</h3>
              <p className="text-[#555555]">
                Commitment to discovering and developing top soccer talent through comprehensive evaluation and professional guidance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 text-[#000000]">
            What Sets Us Apart
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-[#E6E6E6]">
              <h3 className="text-xl font-semibold mb-4 text-[#000000]">For Trainees</h3>
              <ul className="space-y-3 text-[#555555]">
                <li>• Create detailed player profiles</li>
                <li>• Track performance metrics</li>
                <li>• Access professional development tools</li>
                <li>• Connect with scouts and clubs</li>
                <li>• Receive expert feedback</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-xl border border-[#E6E6E6]">
              <h3 className="text-xl font-semibold mb-4 text-[#000000]">For Scouts</h3>
              <ul className="space-y-3 text-[#555555]">
                <li>• Advanced search filters</li>
                <li>• Comprehensive player analytics</li>
                <li>• Digital scouting reports</li>
                <li>• Talent tracking system</li>
                <li>• Direct communication channels</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-xl border border-[#E6E6E6]">
              <h3 className="text-xl font-semibold mb-4 text-[#000000]">For Clubs</h3>
              <ul className="space-y-3 text-[#555555]">
                <li>• Talent pipeline management</li>
                <li>• Team performance analytics</li>
                <li>• Recruitment tools</li>
                <li>• Scout network access</li>
                <li>• Development tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 text-[#000000]">
            Our Growing Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#14D922] mb-2">1000+</div>
              <div className="text-[#000000]">Active Trainees</div>
              <p className="text-sm text-[#555555] mt-2">Developing their skills daily</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#14D922] mb-2">200+</div>
              <div className="text-[#000000]">Professional Scouts</div>
              <p className="text-sm text-[#555555] mt-2">Finding tomorrow's stars</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#14D922] mb-2">50+</div>
              <div className="text-[#000000]">Partner Clubs</div>
              <p className="text-sm text-[#555555] mt-2">Building stronger teams</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
