'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from "../lib/supabase"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/login')
    }, 5000) // 5 วินาที ถ้ายังไม่ redirect ให้ไป login เลย

    async function check() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        clearTimeout(timeout)
        if (session) {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      } catch {
        clearTimeout(timeout)
        router.push('/login')
      }
    }
    check()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-600 text-sm">กำลังโหลด...</p>
    </div>
  )
}