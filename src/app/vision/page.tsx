export default function Vision() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-green-500">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Vision</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Transforming soccer talent scouting through innovation and technology
            </p>
          </div>
        </div>
      </section>

      {/* Vision Statement */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">The Future of Soccer Scouting</h2>
            <p className="text-gray-600 mb-8">
              We envision a future where every talented player has the opportunity to be discovered, regardless of their location or background. Through our AI-powered platform, we're making this vision a reality.
            </p>
          </div>
        </div>
      </section>

      {/* Key Goals */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Goals</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-4">Democratize Scouting</h3>
              <p className="text-gray-600">
                Make professional scouting accessible to players worldwide through technology and innovation.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-4">AI-Driven Insights</h3>
              <p className="text-gray-600">
                Leverage artificial intelligence to provide accurate and unbiased player evaluations.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-4">Global Impact</h3>
              <p className="text-gray-600">
                Create opportunities for talented players from every corner of the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Roadmap</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Platform Enhancement</h3>
                  <p className="text-gray-600">
                    Continuous improvement of our AI algorithms and user experience
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Global Expansion</h3>
                  <p className="text-gray-600">
                    Partnering with clubs and academies worldwide
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                  <p className="text-gray-600">
                    Introducing new performance metrics and prediction models
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Us in Shaping the Future</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're a player, scout, or club, be part of the revolution in soccer talent scouting.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
            Get Started Today
          </button>
        </div>
      </section>
    </main>
  )
} 