'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function SupportPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState([]) // [{file, preview}]
  const fileRef = useRef(null)

  function handleImageSelect(e) {
    const files = Array.from(e.target.files)
    const newImgs = files.slice(0, 3 - images.length).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setImages(prev => [...prev, ...newImgs].slice(0, 3))
    e.target.value = null
  }

  function removeImage(idx) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('message', message)
      images.forEach((img, i) => formData.append(`attachment_${i}`, img.file))

      const res = await fetch('https://formspree.io/f/xwvavjzw', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
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

              {/* image attachment */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">แนบรูป <span className="text-gray-700">(ไม่บังคับ สูงสุด 3 รูป)</span></label>

                {/* preview grid */}
                {images.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-700">
                        <img src={img.preview} alt="" className="w-full h-full object-cover"/>
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white text-xs hover:bg-black"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* add button */}
                {images.length < 3 && (
                  <>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 border border-dashed border-gray-700 hover:border-gray-500 rounded-xl px-4 py-3 w-full transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
                      </svg>
                      แนบรูปภาพ {images.length > 0 ? `(${images.length}/3)` : ''}
                    </button>
                  </>
                )}
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