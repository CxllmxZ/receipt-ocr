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

            {/* quick contact - LINE/email direct */}
            <div className="grid grid-cols-2 gap-2 mb-8">
              <a
                href="https://line.me/ti/p/~@slipscan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-4 py-3 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white">LINE</p>
                  <p className="text-xs text-gray-500 truncate">@slipscan</p>
                </div>
              </a>
              <a
                href="mailto:hi@slipscan.app"
                className="flex items-center gap-2.5 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-4 py-3 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white">Email</p>
                  <p className="text-xs text-gray-500 truncate">hi@slipscan.app</p>
                </div>
              </a>
            </div>

            {/* divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-800"/>
              <span className="text-xs text-gray-600">หรือส่งข้อความมาที่นี่</span>
              <div className="flex-1 h-px bg-gray-800"/>
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