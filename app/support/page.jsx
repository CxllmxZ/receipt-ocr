'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SupportPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('https://formspree.io/f/xwvavjzw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      })

      if (res.ok) {
        setSent(true)
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      }
    } catch {
      setError('เชื่อมต่อไม่ได้ กรุณาลองใหม่')
    }

    setLoading(false)
  }

  const canSubmit = !loading && name && email && message

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-safe">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-5 sm:py-8">

        {/* topbar - same pattern as dashboard */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
            </svg>
            กลับ
          </button>
          <span className="text-xs text-gray-600">SlipScan Support</span>
        </div>

        {sent ? (
          /* success state */
          <div className="text-center space-y-4 py-12">
            <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            </div>
            <h1 className="text-lg font-medium">ส่งเรียบร้อยแล้ว</h1>
            <p className="text-sm text-gray-500">เราจะตอบกลับภายใน 1-2 วันทำการ</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-xs text-gray-400 hover:text-gray-200 border border-gray-800 hover:border-gray-600 rounded-full px-4 py-2 transition"
            >
              กลับหน้าหลัก
            </button>
          </div>
        ) : (
          <>
            {/* header */}
            <div className="mb-8">
              <h1 className="text-xl font-medium mb-1">ติดต่อเรา</h1>
              <p className="text-sm text-gray-500">มีปัญหาหรือคำถาม ส่งมาได้เลย</p>
            </div>

            {/* form */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">ชื่อ</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-gray-600 text-white text-base outline-none transition"
                  placeholder="ชื่อของคุณ"
                  autoComplete="name"
                  autoCapitalize="words"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-gray-600 text-white text-base outline-none transition"
                  placeholder="email@example.com"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">ข้อความ</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-gray-600 text-white text-base outline-none resize-none transition"
                  placeholder="อธิบายปัญหาหรือคำถามของคุณ..."
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 text-white py-3 rounded-xl text-sm font-medium transition"
              >
                {loading ? 'กำลังส่ง...' : 'ส่งข้อความ'}
              </button>

              <p className="text-xs text-gray-700 text-center">ตอบกลับภายใน 1-2 วันทำการ</p>
            </div>
          </>
        )}

      </div>
    </div>
  )
}