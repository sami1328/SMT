'use client'

import { useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    document.body.removeAttribute('cz-shortcut-listen')
  }, [])

  return (
    <>
      <Header />
      <div>
        {children}
      </div>
      <Footer />
    </>
  )
} 