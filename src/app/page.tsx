'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

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
        <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 text-white"
          >
            Welcome to Saql
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 md:mb-12 text-white px-4"
          >
            Revolutionizing soccer talent discovery and development through advanced analytics and professional scouting
          </motion.p>
          
          {/* Sign Up Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl mx-auto px-4"
          >
            <Link 
              href="/signup"
              className="bg-[#14D922] hover:bg-[#10B61E] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-colors duration-200 inline-flex items-center justify-center gap-2 text-base sm:text-lg"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-[#000000]"
          >
            About Saql
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 px-4"
          >
            <p className="text-base sm:text-lg text-[#555555] mb-6 sm:mb-8">
              Saql is a comprehensive platform that bridges the gap between talented players, professional scouts, and football clubs. Our mission is to revolutionize how soccer talent is discovered, evaluated, and developed through cutting-edge technology and expert insights.
            </p>
            <p className="text-base sm:text-lg text-[#555555]">
              Whether you're a young player looking to showcase your skills, a scout searching for the next big talent, or a club aiming to strengthen your roster, Saql provides the tools and connections you need to succeed in the modern football landscape.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 px-4">
            {[
              {
                title: "Precision",
                description: "Advanced analytics and evaluation tools for accurate talent assessment, powered by data-driven insights and professional standards"
              },
              {
                title: "Efficiency",
                description: "Streamlined scouting process and data management, making talent discovery and evaluation faster and more effective"
              },
              {
                title: "Excellence",
                description: "Commitment to discovering and developing top soccer talent through comprehensive evaluation and professional guidance"
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-sm"
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[#000000]">{item.title}</h3>
                <p className="text-sm sm:text-base text-[#555555]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 text-[#000000]"
          >
            What Sets Us Apart
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4">
            {[
              {
                title: "For Trainees",
                items: [
                  "Create detailed player profiles",
                  "Track performance metrics",
                  "Access professional development tools",
                  "Connect with scouts and clubs",
                  "Receive expert feedback"
                ]
              },
              {
                title: "For Scouts",
                items: [
                  "Advanced search filters",
                  "Comprehensive player analytics",
                  "Digital scouting reports",
                  "Talent tracking system",
                  "Direct communication channels"
                ]
              },
              {
                title: "For Clubs",
                items: [
                  "Talent pipeline management",
                  "Team performance analytics",
                  "Recruitment tools",
                  "Scout network access",
                  "Development tracking"
                ]
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-6 sm:p-8 rounded-xl border border-[#E6E6E6]"
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[#000000]">{feature.title}</h3>
                <ul className="space-y-2 sm:space-y-3 text-[#555555]">
                  {feature.items.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="text-sm sm:text-base flex items-center"
                    >
                      <span className="text-[#14D922] mr-2">•</span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 text-[#000000]"
          >
            Our Growing Community
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 px-4">
            {[
              {
                number: "1000+",
                title: "Active Trainees",
                subtitle: "Developing their skills daily"
              },
              {
                number: "200+",
                title: "Professional Scouts",
                subtitle: "Finding tomorrow's stars"
              },
              {
                number: "50+",
                title: "Partner Clubs",
                subtitle: "Building stronger teams"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-[#F5F5F5] rounded-lg"
              >
                <motion.div 
                  className="text-3xl sm:text-4xl font-bold text-[#14D922] mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.2 }}
                  viewport={{ once: true }}
                >
                  {stat.number}
                </motion.div>
                <motion.div 
                  className="text-lg sm:text-xl font-semibold text-[#000000] mb-1"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
                  viewport={{ once: true }}
                >
                  {stat.title}
                </motion.div>
                <motion.p 
                  className="text-sm text-[#555555]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.4 }}
                  viewport={{ once: true }}
                >
                  {stat.subtitle}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
