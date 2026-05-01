'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // รอ Supabase ดึง session จาก URL hash
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
  }, [])

  async function handleReset(e) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-sm space-y-4">

        {!ready ? (
          <p className="text-gray-400 text-sm text-center">กำลังตรวจสอบ link...</p>
        ) : (
          <>
            <h1 className="text-white text-xl font-medium">ตั้งรหัสผ่านใหม่</h1>

            <input
              type="password"
              placeholder="รหัสผ่านใหม่"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white text-sm"
            />
            <input
              type="password"
              placeholder="ยืนยันรหัสผ่านใหม่"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white text-sm"
            />

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              onClick={handleReset}
              disabled={loading || !password || !confirm}
              className="w-full bg-white text-gray-900 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </>
        )}

      </div>
    </div>
  )
}