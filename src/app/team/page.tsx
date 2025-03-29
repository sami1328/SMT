'use client'

interface TeamMember {
  name: string
  role: string
  image: string
  description: string
  linkedin?: string
  email?: string
}

const teamMembers: TeamMember[] = [
  {
    name: 'Sami Alharbi',
    role: 'Software Engineer & Team Leader',
    image: '/team/sami.jpg',
    description: 'Leading the development team with expertise in software engineering and project management.',
    linkedin: 'https://www.linkedin.com/in/sami-alharbi-409a7b2aa/', // Add your LinkedIn URL here
    email: ' mr.samialharbi02@gmail.com'
  },
  {
    name: 'Mohammed Alkashlan',
    role: 'Software Engineer',
    image: '/team/mohammed.jpg',
    description: 'Focused on building robust and scalable applications with modern technologies.',
    linkedin: '', // Add your LinkedIn URL here
    email: ' ' // Add your email here
  },
  {
    name: 'Talal Almutairi',
    role: 'Software Engineer',
    image: '/team/talal.jpg',
    description: 'Specializing in full-stack development and creating innovative solutions.',
    linkedin: 'https://www.linkedin.com/in/talal-almutairi-1794b92ba/', // Add your LinkedIn URL here
    email: 'T.alsuaybi@gmail.com' // Add your email here
  }
]

export default function TeamPage() {
  return (
    <main className="min-h-screen w-full bg-white">
      <div className="max-w-[1400px] mx-auto px-8 py-24">
        <div className="text-center mb-24">
          <h1 className="text-5xl font-bold text-[#000000] mb-6">Our Team</h1>
          <p className="text-xl text-[#555555] max-w-3xl mx-auto">
            Meet the talented individuals behind Saql who are dedicated to revolutionizing soccer talent scouting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 border border-[#E6E6E6]"
            >
              <div className="aspect-w-1 aspect-h-1">
                <div className="w-full h-72 bg-white flex items-center justify-center">
                  <span className="text-7xl text-[#14D922] font-bold">
                    {member.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-[#000000] mb-3">{member.name}</h3>
                <p className="text-[#14D922] font-medium mb-5">{member.role}</p>
                <p className="text-[#555555] mb-8">{member.description}</p>
                
                {/* Contact Information */}
                <div className="space-y-3">
                  {member.email && (
                    <div className="flex items-center space-x-2 text-[#555555]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{member.email}</span>
                    </div>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors w-full justify-center"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      <span>Connect on LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
} 