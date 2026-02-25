'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="w-full h-screen bg-[#080808] flex items-center justify-center">
      <p className="text-white/30">Loading LocalAgent...</p>
    </div>
  )
}
