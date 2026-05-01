'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password'
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-sm space-y-4">
        
        {sent ? (
          <>
            <h1 className="text-white text-xl font-medium">เช็ค email ของคุณ</h1>
            <p className="text-gray-400 text-sm">เราส่ง link สำหรับ reset password ไปที่ {email} แล้ว</p>
            <button onClick={() => router.push('/login')} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">
              กลับหน้า login
            </button>
          </>
        ) : (
          <>
            <h1 className="text-white text-xl font-medium">ลืมรหัสผ่าน</h1>
            <p className="text-gray-400 text-sm">กรอก email แล้วเราจะส่ง link reset password ให้</p>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white text-sm"
            />

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              className="w-full bg-white text-gray-900 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition"
            >
              {loading ? 'กำลังส่ง...' : 'ส่ง link'}
            </button>

            <button onClick={() => router.push('/login')} className="w-full text-gray-600 text-xs hover:text-gray-400">
              กลับหน้า login
            </button>
          </>
        )}

      </div>
    </div>
  )
}