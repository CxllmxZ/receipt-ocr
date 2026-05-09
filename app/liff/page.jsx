'use client'
import { useEffect, useState, useCallback } from 'react'
import { useLiff } from '@/hooks/useLiff'

const N8N_BASE = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL?.replace(/\/upload$/, '') || 'https://n8n-production-8d4e.up.railway.app/webhook'
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'https://receipt-ocr-rouge.vercel.app'

export default function LiffPage() {
  const { accessToken, ready: liffReady } = useLiff()
  const [profile, setProfile] = useState(null)
  const [credits, setCredits] = useState(null)
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Load profile + history on mount
  useEffect(() => {
    if (!accessToken) return

    const fetchAll = async () => {
      setLoading(true)
      try {
        const [meRes, histRes] = await Promise.all([
          fetch(`${N8N_BASE}/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          }),
          fetch(`${N8N_BASE}/history`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
        ])

        if (meRes.ok) {
          const me = await meRes.json()
          setProfile(me)
          setCredits(me.credits)
        }

        if (histRes.ok) {
          const hist = await histRes.json()
          setReceipts(hist.receipts || [])
        }
      } catch (err) {
        setError('โหลดข้อมูลไม่สำเร็จ')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [accessToken])

  const refreshHistory = useCallback(async () => {
    if (!accessToken) return
    try {
      const res = await fetch(`${N8N_BASE}/history`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (res.ok) {
        const data = await res.json()
        setReceipts(data.receipts || [])
      }
    } catch {}
  }, [accessToken])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !accessToken) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(`${N8N_BASE}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData
      })
      const data = await res.json()

      if (data.success) {
        setResult(data)
        if (typeof data.remaining === 'number') {
          setCredits(data.remaining)
        }
        refreshHistory()
      } else {
        setError(data.reject_reason || data.error || 'อัปโหลดไม่สำเร็จ')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // ---- Loading ----
  if (!liffReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-700 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  // ---- Paywall ----
  if (credits === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            credits หมดแล้ว
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            ซื้อ credits เพิ่มเพื่อสแกนสลิปต่อ<br />
            กลับไปที่ web เพื่อจัดการ
          </p>
          <a
            href={WEB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition"
          >
            เปิด web
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      </div>
    )
  }

  // ---- Main ----
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 dark:bg-gray-950/80 border-b border-gray-100 dark:border-gray-900">
        <div className="px-4 py-3 flex items-center gap-3">
          {profile?.picture_url ? (
            <img
              src={profile.picture_url}
              alt={profile.display_name || 'avatar'}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-semibold">
              {(profile?.display_name || 'U')[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-500 dark:text-gray-500 uppercase tracking-wide">
              สวัสดี
            </p>
            <p className="text-sm font-medium truncate">
              {profile?.display_name || 'ผู้ใช้'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-semibold">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5.5 4l-3 7L12 22l9.5-11-3-7h-13zm.5 1h12l2.4 5.6L12 19.5 3.6 10.6 6 5z" />
            </svg>
            <span>{credits ?? '-'}</span>
          </div>
        </div>
      </header>

      {/* Upload */}
      <section className="px-4 pt-5 pb-3">
        <label className={`
          relative block w-full overflow-hidden rounded-2xl text-center cursor-pointer
          transition-all active:scale-[0.99]
          ${uploading
            ? 'bg-gray-100 dark:bg-gray-900 cursor-wait'
            : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-lg shadow-green-500/20'
          }
        `}>
          <div className="px-6 py-7 flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-700 border-t-green-600 rounded-full animate-spin" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  กำลังประมวลผล...
                </span>
              </>
            ) : (
              <>
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
                <span className="text-base font-semibold text-white">
                  อัปโหลดสลิป
                </span>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {error && (
          <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
              {error}
            </p>
          </div>
        )}
      </section>

      {/* History */}
      <section className="px-4 pt-3 pb-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">
            สลิปล่าสุด
          </h2>
          {receipts.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-600">
              {receipts.length} รายการ
            </span>
          )}
        </div>

        {receipts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              ยังไม่มีสลิป
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
              อัปโหลดสลิปแรกเลย
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {receipts.slice(0, 5).map(r => (
              <ReceiptCard key={r.id} receipt={r} />
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            href={`${WEB_URL}/dashboard`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
          >
            ดูทั้งหมดใน web
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      </section>

      {/* Result Modal */}
      {result && (
        <ResultModal result={result} onClose={() => setResult(null)} />
      )}
    </div>
  )
}

function ReceiptCard({ receipt }) {
  const amount = Number(receipt.amount || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-100 dark:border-gray-800/50 rounded-xl p-3.5 transition">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="flex items-baseline gap-1">
          <span className="text-[11px] text-gray-400 dark:text-gray-600">฿</span>
          <span className="text-base font-semibold text-gray-900 dark:text-white tabular-nums">
            {amount}
          </span>
        </div>
        <span className="text-[11px] text-gray-400 dark:text-gray-600">
          {receipt.date}
        </span>
      </div>
      {receipt.receiver_name && (
        <p className="text-sm truncate text-gray-700 dark:text-gray-300 mb-0.5">
          {receipt.receiver_name}
        </p>
      )}
      {(receipt.bank_from || receipt.bank_to) && (
        <p className="text-[11px] text-gray-500 dark:text-gray-500 truncate flex items-center gap-1">
          <span>{receipt.bank_from || '—'}</span>
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          <span>{receipt.bank_to || '—'}</span>
        </p>
      )}
    </div>
  )
}

function ResultModal({ result, onClose }) {
  const amount = Number(result.amount || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-3 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Success header */}
        <div className="px-5 py-3.5 bg-green-50 dark:bg-green-500/10 border-b border-green-100 dark:border-green-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              สแกนสำเร็จ
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-green-700 dark:text-green-400 hover:opacity-70 transition"
            aria-label="ปิด"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Amount + meta */}
        <div className="p-6 space-y-5">
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1.5 mb-2">
              <span className="text-sm text-gray-400 dark:text-gray-600">฿</span>
              <span className="text-4xl font-semibold text-gray-900 dark:text-white tabular-nums">
                {amount}
              </span>
            </div>
            {result.date && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {result.date}
              </p>
            )}
          </div>

          {result.receiver_name && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-3 space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-600">
                ผู้รับ
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {result.receiver_name}
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-500 active:scale-[0.99] text-white py-3 rounded-xl text-sm font-medium transition"
          >
            สแกนใบใหม่
          </button>
        </div>
      </div>
    </div>
  )
}