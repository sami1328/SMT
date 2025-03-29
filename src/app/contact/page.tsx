'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: submitError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
          }
        ])

      if (submitError) throw submitError

      setSuccess('Thank you for your message! We will get back to you soon.')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center">
      {/* Hero Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">Contact Us</h1>
            <p className="text-lg text-[#555555] max-w-2xl mx-auto mb-8">
              Get in touch with our team for any questions or inquiries
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-4 bg-white">
        <div className="container mx-auto px-8">
          <div className="max-w-xl mx-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {success}
              </div>
            )}
            
            {/* Contact Form */}
            <div className="bg-white p-6 rounded-xl border border-[#DDDDDD] shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-base font-medium text-black mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#14D922] focus:border-[#14D922] text-black"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-base font-medium text-black mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#14D922] focus:border-[#14D922] text-black"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-base font-medium text-black mb-1"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#14D922] focus:border-[#14D922] bg-white text-black [&>option]:bg-white [&>option]:text-black [&>option]:py-1 [&>option:hover]:bg-[#14D922] [&>option:hover]:text-white"
                    required
                    disabled={loading}
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-base font-medium text-black mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-[#DDDDDD] rounded-lg focus:ring-2 focus:ring-[#14D922] focus:border-[#14D922] text-black"
                    required
                    disabled={loading}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#14D922] text-white py-2 px-4 rounded-lg text-base font-semibold hover:bg-[#11B91D] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 