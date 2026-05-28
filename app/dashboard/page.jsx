'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"

const PRESETS = [
  { label: '7 วันล่าสุด', days: 7 },
  { label: '30 วันล่าสุด', days: 30 },
  { label: 'เดือนนี้', days: null, mode: 'this_month' },
  { label: 'เดือนที่แล้ว', days: null, mode: 'last_month' },
  { label: 'กำหนดเอง', days: null, mode: 'custom' },
]

function getPresetRange(preset) {
  const now = new Date()
  if (preset.days) {
    const from = new Date(now)
    from.setDate(from.getDate() - preset.days)
    return { from: from.toISOString().split('T')[0], to: now.toISOString().split('T')[0] }
  }
  if (preset.mode === 'this_month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: from.toISOString().split('T')[0], to: now.toISOString().split('T')[0] }
  }
  if (preset.mode === 'last_month') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const to = new Date(now.getFullYear(), now.getMonth(), 0)
    return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] }
  }
  return { from: '', to: '' }
}

const PAGE_SIZE = 20

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [receipts, setReceipts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [presetIndex, setPresetIndex] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [uploadProgress, setUploadProgress] = useState([])
  const [previewUrl, setPreviewUrl] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  function showToast(message, type = 'error') {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  useEffect(() => {
    const init = async () => {
      await checkSession()
      // clear หลัง Supabase process token เสร็จแล้ว
      if (window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
    init()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    applyFilter()
  }, [receipts, dateFrom, dateTo])

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    setUser(session.user)
    await fetchData(session.user.id)
  }

  async function fetchData(userId) {
    const { data: userData } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    const { data: receiptData } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500)

    setCredits(userData?.credits ?? 0)
    setReceipts(receiptData ?? [])
    setCurrentPage(1)

    const range = getPresetRange(PRESETS[1])
    setDateFrom(range.from)
    setDateTo(range.to)

    setLoading(false)
  }

  function applyFilter() {
    if (!dateFrom || !dateTo) { setFiltered(receipts); return }
    const from = new Date(dateFrom + 'T00:00:00+07:00')
    const to = new Date(dateTo + 'T23:59:59+07:00')
    to.setHours(23, 59, 59)
    setFiltered(receipts.filter(r => {
      const uploaded = new Date(r.created_at)
      return uploaded >= from && uploaded <= to
    }))
  }

  function handlePreset(index) {
    setPresetIndex(index)
    const preset = PRESETS[index]
    if (preset.mode === 'custom') return
    const range = getPresetRange(preset)
    setDateFrom(range.from)
    setDateTo(range.to)
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    e.target.value = null
    setUploading(true)

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (files.length > 10) {
      showToast('อัพโหลดได้สูงสุด 10 รูปต่อครั้ง')
      setUploading(false)
      return
    }

    const { data: { session } } = await supabase.auth.getSession()

    // ตั้งค่า progress เริ่มต้น
    setUploadProgress(files.map((f, i) => ({
      index: i,
      name: f.name,
      status: 'waiting'
    })))

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      setUploadProgress(prev => prev.map((p, idx) =>
        idx === i ? { ...p, status: 'processing' } : p
      ))

      if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
        setUploadProgress(prev => prev.map((p, idx) =>
          idx === i ? { ...p, status: 'error', message: 'ไฟล์ไม่รองรับ' } : p
        ))
        continue
      }

      const formData = new FormData()
      formData.append('image', file)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)

      try {
        const res = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        const result = await res.json()

        if (res.status === 429) {
          const seconds = result.retry_after ?? 60
          // toast - block ทั้ง session หยุด loop
          showToast(`ส่งเร็วเกินไป รอ ${seconds} วินาทีแล้วลองใหม่`, 'warning')
          setUploadProgress(prev => prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error', message: `rate limited` } : p
          ))
          break
        } else if (result.error === 'no_credits') {
          // toast แล้ว redirect
          showToast('credits หมดแล้ว กำลังพาไปซื้อ...', 'error')
          setUploadProgress(prev => prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error', message: 'credits หมด' } : p
          ))
          setTimeout(() => router.push('/pricing'), 1500)
          break
        } else if (result.error === 'not_a_slip') {
          // progress list - per-file
          setUploadProgress(prev => prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error', message: `ไม่ใช่สลิป: ${result.reject_reason ?? ''}` } : p
          ))
        } else if (result.error === 'low_confidence') {
          // progress list - per-file
          setUploadProgress(prev => prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error', message: `รูปไม่ชัดเจน: ${result.reject_reason ?? ''}` } : p
          ))
        } else if (result.success) {
          const isWarning = result.is_authentic === false
          setUploadProgress(prev => prev.map((p, idx) =>
            idx === i ? {
              ...p,
              status: isWarning ? 'warning' : 'success',
              message: isWarning ? '⚠️ บันทึกแล้ว แต่สลิปน่าสงสัย' : null
            } : p
          ))
        } else {
          setUploadProgress(prev => prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error', message: result.error ?? 'เกิดข้อผิดพลาด' } : p
          ))
        }
      } catch (err) {
        clearTimeout(timeoutId)
        setUploadProgress(prev => prev.map((p, idx) =>
          idx === i ? { ...p, status: 'error', message: err.name === 'AbortError' ? 'timeout' : 'เชื่อมต่อไม่ได้' } : p
        ))
      }

      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    await fetchData(session.user.id)
    setTimeout(() => setUploadProgress([]), 3000)
    setUploading(false)
  }

  const [editReceipt, setEditReceipt] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  function openEdit(r) {
    setEditReceipt(r)
    setEditForm({
      receiver_name: (r.receiver_name == null || r.receiver_name === 'null') ? '' : r.receiver_name,
      amount: (r.amount == null || r.amount === 'null') ? '' : r.amount,
      date: (r.date == null || r.date === 'null') ? '' : r.date,
      time: (r.time == null || r.time === 'null') ? '' : r.time,
      sender_name: (r.sender_name == null || r.sender_name === 'null') ? '' : r.sender_name,
      bank_from: (r.bank_from == null || r.bank_from === 'null') ? '' : r.bank_from,
      bank_to: (r.bank_to == null || r.bank_to === 'null') ? '' : r.bank_to,
      note: (r.note == null || r.note === 'null') ? '' : r.note,
    })
  }

  async function saveEdit() {
    setSaving(true)
    const { error } = await supabase
      .from('receipts')
      .update(editForm)
      .eq('id', editReceipt.id)

    if (!error) {
      setReceipts(prev => prev.map(r => r.id === editReceipt.id ? { ...r, ...editForm } : r))
      setEditReceipt(null)
    }
    setSaving(false)
  }

  function exportCSV() {
    if (!filtered.length) return
    const headers = ['วันที่อัพโหลด', 'ร้าน/ผู้รับ', 'ผู้ส่ง', 'จำนวนเงิน', 'ธนาคารต้นทาง', 'ธนาคารปลายทาง', 'เลขอ้างอิง', 'หมายเหตุ']
    const rows = filtered.map(r => [
      new Date(r.created_at).toLocaleString('th-TH'),
      (r.receiver_name == null || r.receiver_name === 'null') ? '' : r.receiver_name,
      (r.sender_name == null || r.sender_name === 'null') ? '' : r.sender_name,
      (r.amount == null || r.amount === 'null') ? '' : r.amount,
      (r.bank_from == null || r.bank_from === 'null') ? '' : r.bank_from,
      (r.bank_to == null || r.bank_to === 'null') ? '' : r.bank_to,
      r.ref_number ?? '',
      r.note == null || r.note === 'null' ? '' : r.note,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `slips_${dateFrom}_to_${dateTo}.csv`
    a.click()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const totalAmount = filtered.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pagedFiltered = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <p className="text-gray-400 text-sm">กำลังโหลด...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-safe">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

        {/* topbar */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <svg width="130" height="28" viewBox="0 0 200 48" xmlns="http://www.w3.org/2000/svg" aria-label="SlipScan">
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0"/>
                <stop offset="50%" stopColor="#22c55e" stopOpacity="1"/>
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="32" height="42" rx="3" fill="#1a2a1a" stroke="#22c55e" strokeWidth="1.6"/>
            <polyline points="0,42 3,37 6,42 9,37 12,42 15,37 18,42 21,37 24,42 27,37 30,42 32,42" fill="none" stroke="#22c55e" strokeWidth="1.6" strokeLinejoin="round"/>
            <line x1="5" y1="10" x2="27" y2="10" stroke="#22c55e" strokeWidth="1.1" strokeLinecap="round" opacity="0.35"/>
            <line x1="5" y1="16" x2="21" y2="16" stroke="#22c55e" strokeWidth="1.1" strokeLinecap="round" opacity="0.25"/>
            <rect x="0" y="20" width="32" height="9" fill="#22c55e" opacity="0.08"/>
            <line x1="-6" y1="24.5" x2="38" y2="24.5" stroke="url(#sg)" strokeWidth="1.8"/>
            <line x1="-6" y1="20" x2="-6" y2="29" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
            <line x1="38" y1="20" x2="38" y2="29" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
            <line x1="5" y1="32" x2="27" y2="32" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" opacity="0.45"/>
            <text x="48" y="31" fontFamily="-apple-system,BlinkMacSystemFont,sans-serif" fontSize="26" fontWeight="700" letterSpacing="-0.5">
              <tspan fill="#ffffff">Slip</tspan><tspan fill="#22c55e">Scan</tspan>
            </text>
          </svg>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-gray-900 border border-gray-800 rounded-full px-3 py-1.5 whitespace-nowrap">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 mb-0.5"></span>
              {credits} credits
            </span>
            <button onClick={() => router.push('/pricing')} className="text-xs text-white bg-green-600 hover:bg-green-500 rounded-full px-3 py-1.5 font-medium transition">
              + ซื้อ
            </button>
            {/* desktop links */}
            <button onClick={() => router.push('/support')} className="hidden sm:block text-xs text-gray-500 hover:text-gray-300 px-2">
              ติดต่อเรา
            </button>
            {/* settings */}
            <button onClick={() => router.push('/settings')} className="hidden sm:block text-xs text-gray-500 hover:text-gray-300 px-2">
              ตั้งค่า
            </button>
            <button onClick={handleLogout} className="hidden sm:block text-xs text-gray-500 hover:text-gray-300 px-2">
              ออกจากระบบ
            </button>
            {/* mobile menu */}
            <div className="relative sm:hidden">
              <button onClick={() => setMenuOpen(o => !o)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-800 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 bg-gray-900 border border-gray-800 rounded-xl py-1 w-36 z-50 shadow-xl">
                  <button onClick={() => { router.push('/support'); setMenuOpen(false) }} className="w-full text-left text-sm text-gray-400 px-4 py-3 hover:bg-gray-800">
                    ติดต่อเรา
                  </button>
                  <button onClick={() => { router.push('/settings'); setMenuOpen(false) }} className="w-full text-left text-sm text-gray-400 px-4 py-3 hover:bg-gray-800">
                    ตั้งค่า
                  </button>
                  <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="w-full text-left text-sm text-gray-400 px-4 py-3 hover:bg-gray-800">
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
          {[
            { label: 'credits', value: credits.toLocaleString('th-TH'), sub: `ใช้ไป ${receipts.length} ครั้ง` },
            { label: 'สแกนแล้ว', value: receipts.length.toLocaleString('th-TH'), sub: 'ใบเสร็จทั้งหมด' },
            { label: 'ยอดรวม', value: totalAmount >= 1000000 ? `฿${(totalAmount/1000000).toFixed(1)}M` : totalAmount >= 1000 ? `฿${(totalAmount/1000).toFixed(1)}K` : `฿${totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, sub: 'ช่วงที่เลือก' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
              <p className="text-xs text-gray-500 mb-1 truncate">{s.label}</p>
              <p className="text-base sm:text-xl font-medium truncate">{s.value}</p>
              <p className="text-xs text-gray-600 mt-0.5 truncate hidden sm:block">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* upload zone */}
        <label className={`block border border-dashed border-gray-700 rounded-xl p-8 sm:p-6 text-center mb-6 sm:mb-8 cursor-pointer hover:border-gray-500 active:border-green-600 transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
          <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-3 sm:mb-2">
            <svg className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-300">{uploading ? 'กำลังประมวลผล...' : 'อัพโหลดสลิป / ใบเสร็จ'}</p>
          <p className="text-xs text-gray-600 mt-1">JPG, PNG ขนาดไม่เกิน 5MB</p>
        </label>

        {/* progress list */}
        {uploadProgress.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 space-y-2">
            <p className="text-xs text-gray-500 mb-3">กำลังประมวลผล {uploadProgress.filter(p => p.status === 'success').length}/{uploadProgress.length} รูป</p>
            {uploadProgress.map((p, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {p.status === 'waiting' && <span className="text-gray-600">⏳</span>}
                  {p.status === 'processing' && <span className="text-yellow-400 animate-pulse">⚙️</span>}
                  {p.status === 'success' && <span className="text-green-400">✅</span>}
                  {p.status === 'error' && <span className="text-red-400">❌</span>}
                  {p.status === 'warning' && <span className="text-yellow-400">⚠️</span>}
                </div>
                <span className={`truncate flex-1 ${p.status === 'error' ? 'text-red-400' : 'text-gray-400'}`}>
                  {p.name}
                </span>
                {p.message && <span className="text-red-400 flex-shrink-0">{p.message}</span>}
              </div>
              
            ))}
          </div>          
        )}

        

        {/* filter toolbar */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">ประวัติการอัพโหลด</span>
          <span className="text-xs text-gray-500">{filtered.length} รายการ</span>
        </div>

        <div className="flex flex-col gap-2 mb-2">
          {/* mobile: dropdown / desktop: pill buttons */}
          <div className="flex gap-2 items-center">
            <select
              value={presetIndex}
              onChange={e => handlePreset(Number(e.target.value))}
              className="sm:hidden flex-1 text-sm bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-300 appearance-none"
            >
              {PRESETS.map((p, i) => (
                <option key={i} value={i}>{p.label}</option>
              ))}
            </select>
            <div className="hidden sm:flex gap-1">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handlePreset(i)}
                  className={`text-xs px-3 py-2 rounded-lg border transition whitespace-nowrap ${presetIndex === i ? 'border-gray-400 text-white bg-gray-800' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* date + export */}
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} max={dateTo} onChange={e => { setDateFrom(e.target.value); setPresetIndex(4) }}
              className="text-xs bg-gray-900 border border-gray-800 rounded-lg px-2 py-2 text-gray-300 flex-1 min-w-0" />
            <span className="text-xs text-gray-600 flex-shrink-0">ถึง</span>
            <input type="date" value={dateTo} min={dateFrom} onChange={e => { setDateTo(e.target.value); setPresetIndex(4) }}
              className="text-xs bg-gray-900 border border-gray-800 rounded-lg px-2 py-2 text-gray-300 flex-1 min-w-0"/>
            <button onClick={exportCSV} disabled={!filtered.length}
              className="flex items-center gap-1 text-xs px-3 py-2 border border-gray-800 rounded-lg text-gray-400 hover:border-gray-600 hover:text-gray-200 disabled:opacity-30 transition flex-shrink-0">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="hidden sm:inline">export</span> CSV
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-700 mb-3">* กรองตามวันที่อัพโหลด ไม่ใช่วันที่บนสลิป</p>

        {/* receipt list */}
        <div className="flex flex-col gap-2">
          {pagedFiltered.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-sm">
              ไม่มีข้อมูลในช่วงที่เลือก
            </div>
          ) : pagedFiltered.map(r => (
            <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="16" height="18" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="0.5" width="14" height="16" rx="2" stroke="#4ade80" strokeWidth="1.2" fill="#1a2a1a"/>
                    <polyline points="1,16.5 2.8,13.5 4.6,16.5 6.4,13.5 8.2,16.5 10,13.5 11.8,16.5 13.6,13.5 15,16.5" fill="none" stroke="#4ade80" strokeWidth="1.2" strokeLinejoin="round"/>
                    <line x1="3.5" y1="5" x2="12.5" y2="5" stroke="#4ade80" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
                    <line x1="3.5" y1="8" x2="10" y2="8" stroke="#4ade80" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
                    <line x1="3.5" y1="11" x2="12.5" y2="11" stroke="#4ade80" strokeWidth="1.1" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{r.receiver_name ?? '—'}</p>
                    {r.is_authentic === false && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full whitespace-nowrap">! น่าสงสัย</span>
                    )}
                    {r.is_authentic === true && r.confidence === 'low' && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full whitespace-nowrap">! ไม่ชัดเจน</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {(r.bank_from == null || r.bank_from === 'null') ? '' : r.bank_from}{r.bank_from && r.bank_to ? ' → ' : ''}{(r.bank_to == null || r.bank_to === 'null') ? '' : r.bank_to}
                    {r.ref_number ? ` · ref: ${r.ref_number}` : ''}
                  </p>
                  {r.suspicious_signs?.length > 0 && (
                    <p className="text-xs text-red-400 mt-0.5 truncate">{r.suspicious_signs.join(', ')}</p>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium">฿{parseFloat(r.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {new Date(r.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
                <div className="flex items-center gap-1.5 justify-end mt-2">
                  <button
                    onClick={() => openEdit(r)}
                    className="text-xs text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500 rounded-lg px-3 py-1.5 transition min-h-[32px]"
                  >
                    แก้ไข
                  </button>
                  {r.image_url && (
                    <button
                      onClick={() => setPreviewUrl(r.image_url)}
                      className="text-xs text-green-400 hover:text-green-300 border border-green-500/40 hover:border-green-400/60 rounded-lg px-3 py-1.5 transition min-h-[32px]"
                    >
                      ดูรูป
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {editReceipt && (
            <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4">
              <div className="bg-gray-900 rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto space-y-3" onClick={e => e.stopPropagation()}>
                
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-medium">แก้ไขข้อมูล</h2>
                  <button onClick={() => setEditReceipt(null)} className="text-gray-600 hover:text-gray-400 text-xs">✕</button>
                </div>

                {[
                  { key: 'receiver_name', label: 'ผู้รับ' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                    <input
                      type="text"
                      value={editForm[key]}
                      onChange={e => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                    />
                  </div>
                ))}

                {/* amount field - second position */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">จำนวนเงิน</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">฿</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={editForm['amount']}
                      onChange={e => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                      onBlur={e => {
                        const val = parseFloat(e.target.value)
                        if (!isNaN(val)) setEditForm(prev => ({ ...prev, amount: val.toFixed(2) }))
                      }}
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm text-right"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {editForm['amount'] && !isNaN(parseFloat(editForm['amount'])) && (
                    <p className="text-xs text-gray-600 text-right mt-1">
                      = ฿{parseFloat(editForm['amount']).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>

                {[
                  { key: 'date', label: 'วันที่' },
                  { key: 'time', label: 'เวลา' },
                  { key: 'sender_name', label: 'ผู้ส่ง' },
                  { key: 'bank_from', label: 'ธนาคารต้นทาง' },
                  { key: 'bank_to', label: 'ธนาคารปลายทาง' },
                  { key: 'note', label: 'หมายเหตุ' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                    <input
                      type="text"
                      value={editForm[key]}
                      onChange={e => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                    />
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setEditReceipt(null)}
                    className="flex-1 py-3 text-sm text-gray-500 border border-gray-800 rounded-xl hover:border-gray-600"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex-1 py-3 text-sm bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 disabled:opacity-50"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>

              </div>
            </div>
          )}   

          {previewUrl && (
            <div 
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4"
              onClick={() => setPreviewUrl(null)}
            >
              <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="absolute -top-8 right-0 text-gray-400 hover:text-white text-sm"
                >
                  ✕ ปิด
                </button>
                <img
                  src={previewUrl}
                  alt="slip"
                  className="w-full rounded-xl"
                />
              </div>
            </div>
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs border border-gray-800 rounded-lg text-gray-500 hover:border-gray-600 disabled:opacity-30"
              >←</button>

              {(() => {
                const pages = []
                const delta = 1
                const left = currentPage - delta
                const right = currentPage + delta

                let prev = null
                for (let p = 1; p <= totalPages; p++) {
                  if (p === 1 || p === totalPages || (p >= left && p <= right)) {
                    if (prev && p - prev > 1) {
                      pages.push(<span key={`dots-${p}`} className="px-2 text-xs text-gray-600">…</span>)
                    }
                    pages.push(
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`px-3 py-1.5 text-xs border rounded-lg transition ${currentPage === p ? 'border-gray-400 text-white bg-gray-800' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
                      >{p}</button>
                    )
                    prev = p
                  }
                }
                return pages
              })()}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs border border-gray-800 rounded-lg text-gray-500 hover:border-gray-600 disabled:opacity-30"
              >→</button>
            </div>
          )}
        </div>

      </div>

      {/* toast notifications */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-80 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border pointer-events-auto transition-all ${
              t.type === 'error' ? 'bg-gray-900 border-red-500/30 text-red-400' :
              t.type === 'success' ? 'bg-gray-900 border-green-500/30 text-green-400' :
              'bg-gray-900 border-yellow-500/30 text-yellow-400'
            }`}
          >
            <span className="text-base leading-none mt-0.5 flex-shrink-0">
              {t.type === 'error' ? '✕' : t.type === 'success' ? '✓' : '!'}
            </span>
            <p className="text-sm flex-1">{t.message}</p>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-gray-600 hover:text-gray-400 flex-shrink-0 text-xs"
            >✕</button>
          </div>
        ))}
      </div>

    </div>
  )
}