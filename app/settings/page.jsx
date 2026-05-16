'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const N8N_BASE = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL?.replace(/\/upload$/, '') || 'https://n8n-production-8d4e.up.railway.app/webhook'
const LINE_LOGIN_CHANNEL_ID = process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID || '2010067305'
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'https://receipt-ocr-rouge.vercel.app'
const REDIRECT_URI = `${WEB_URL}/auth/line/callback`

export default function SettingsPage() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [connectingGoogle, setConnectingGoogle] = useState(false)

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  // Callback handler — รวม query + hash + verify identities จริง
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hashStr = window.location.hash.startsWith('#')
      ? window.location.hash.substring(1)
      : window.location.hash
    const hashParams = new URLSearchParams(hashStr)

    const linked = params.get('linked')
    const queryError = params.get('error')
    const hashError = hashParams.get('error') /*|| hashParams.get('error_code')*/
    const hashErrorCode = hashParams.get('error_code')
    const hashErrorDesc = hashParams.get('error_description')

    const hasAnyCallback = linked || queryError || hashError

    if (!hasAnyCallback) return

    // clear URL ทันที ก่อน handle — กัน toast ซ้ำตอนกด back แล้วกลับมา
    window.history.replaceState(null, '', '/settings')

    const handleCallback = async () => {
      // LINE success (n8n flow ที่ verify ผ่าน DB ของเราเอง)
      if (linked === 'true' || linked === 'line') {
        const isPending = sessionStorage.getItem('line_link_pending')
        sessionStorage.removeItem('line_link_pending')
        if (!isPending) return
        showToast('success', 'เชื่อมต่อ LINE สำเร็จ 🎉')

        return
      }      

      // Google flow — มี hash error หรือ linked=google
      if (linked === 'google' || hashError) {
        if (hashError) {
          const isAlreadyLinked =
            hashErrorCode === 'identity_already_exists' ||
            (hashErrorDesc || '').toLowerCase().includes('already')            

          if (isAlreadyLinked) {
            showToast('error', 'Google account นี้ถูกใช้งานโดย user อื่นแล้ว')
          } else {
            showToast('error', 'เชื่อมต่อ Google ไม่สำเร็จ')
          }


          return
        }

        // ไม่มี hash error แต่มี linked=google → verify จริงผ่าน server
        try {
          // force refresh session ก่อน — getUser() อาจ return cached session ที่ยังไม่มี Google identity
          await supabase.auth.refreshSession()
          const { data: { user: freshUser } } = await supabase.auth.getUser()
          const hasGoogle = freshUser?.identities?.some(i => i.provider === 'google')

          if (hasGoogle) {
            showToast('success', 'เชื่อมต่อ Google สำเร็จ 🎉')
            // reload หลัง 1 วินาที เพื่อให้ toast แสดงก่อน แล้ว UI จะ refresh สมบูรณ์
            //setTimeout(() => window.location.replace('/settings'), 1000)
          } else {
            showToast('error', 'Google account นี้อาจถูกใช้งานโดย user อื่นแล้ว')
          }
        } catch (e) {
          showToast('error', 'ไม่สามารถยืนยันการเชื่อมต่อได้')
        }


      }

      // LINE error (query string จาก /auth/line/callback)
      if (queryError) {
        const isPending = sessionStorage.getItem('line_link_pending')
        sessionStorage.removeItem('line_link_pending')
        if (!isPending) return
        const errMap = {
          line_already_linked: 'LINE account นี้ถูกใช้งานโดย user อื่นแล้ว',
          failed: 'เชื่อมต่อไม่สำเร็จ ลองใหม่อีกครั้ง',
          state_mismatch: 'พบปัญหาด้านความปลอดภัย ลองใหม่อีกครั้ง'
        }
        showToast('error', errMap[queryError] || `เกิดข้อผิดพลาด: ${queryError}`)
        return
      }
    }

    handleCallback()
  }, [])

  // Load user + profile
  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      try {
        const res = await fetch(`${N8N_BASE}/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch {}

      setLoading(false)
    }

    loadData()
  }, [])

  const handleConnectLine = () => {
    const state = Math.random().toString(36).substring(2)
    sessionStorage.setItem('line_oauth_state', state)
    sessionStorage.setItem('line_link_pending', '1')

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINE_LOGIN_CHANNEL_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'profile',
      state
    })

    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params}`
  }

  const handleConnectGoogle = async () => {
    setConnectingGoogle(true)
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: `${WEB_URL}/settings?linked=google`
        }
      })
      if (error) {
        const code = error.code || error.message || ''
        if (code.includes('identity_already_exists') || code.includes('already')) {
          showToast('error', 'Google account นี้ถูกใช้งานโดย user อื่นแล้ว')
        } else if (code.includes('manual_linking') || code.includes('disabled')) {
          showToast('error', 'ระบบยังไม่เปิดใช้งาน — กรุณาติดต่อ admin')
        } else {
          showToast('error', `เชื่อมต่อ Google ไม่สำเร็จ: ${error.message}`)
        }
        setConnectingGoogle(false)
      }
    } catch (e) {
      showToast('error', 'เชื่อมต่อ Google ไม่สำเร็จ')
      setConnectingGoogle(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-green-600 rounded-full animate-spin" />
      </div>
    )
  }

  const isLineConnected = !!profile?.line_user_id

  const googleIdentity = user?.identities?.find(i => i.provider === 'google')
  const isGoogleConnected = !!googleIdentity
  const googleEmail = googleIdentity?.identity_data?.email

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-all
          ${toast.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-500 text-white'
          }`}>
          {toast.message}
        </div>
      )}

      <header className="border-b border-gray-900">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.replace('/dashboard')}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-900 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="font-semibold text-base">ตั้งค่า</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            บัญชี
          </p>
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {(profile?.display_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.display_name || user?.email || '—'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.app_metadata?.provider === 'google' ? 'Google account' : 'Email account'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            บัญชีที่เชื่อมต่อ
          </p>
          <div className="bg-gray-900 rounded-xl overflow-hidden divide-y divide-gray-800">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#06C755] flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15.5H7.5v-3H10V10c0-2.21 1.79-4 4-4h2.5v3H14c-.55 0-1 .45-1 1v2.5h3.5l-.5 3H13V21.8c4.56-.93 8-4.96 8-9.8C21 6.48 16.52 2 12 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">LINE</p>
                {isLineConnected ? (
                  <p className="text-xs text-green-400 truncate">
                    {profile?.display_name || 'เชื่อมต่อแล้ว'}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    ยังไม่ได้เชื่อมต่อ
                  </p>
                )}
              </div>
              {isLineConnected ? (
                <div className="flex items-center gap-1.5 text-green-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-xs font-medium">เชื่อมต่อแล้ว</span>
                </div>
              ) : (
                <button
                  onClick={handleConnectLine}
                  className="px-3 py-1.5 bg-[#06C755] hover:bg-[#05b04a] text-white text-xs font-medium rounded-lg transition flex-shrink-0"
                >
                  เชื่อมต่อ
                </button>
              )}
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Google</p>
                {isGoogleConnected ? (
                  <p className="text-xs text-green-400 truncate">
                    {googleEmail || 'เชื่อมต่อแล้ว'}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    ยังไม่ได้เชื่อมต่อ
                  </p>
                )}
              </div>
              {isGoogleConnected ? (
                <div className="flex items-center gap-1.5 text-green-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-xs font-medium">เชื่อมต่อแล้ว</span>
                </div>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  disabled={connectingGoogle}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs font-medium rounded-lg transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connectingGoogle ? 'กำลังเชื่อม…' : 'เชื่อมต่อ'}
                </button>
              )}
            </div>
          </div>

          {(!isLineConnected || !isGoogleConnected) && (
            <p className="mt-2 text-xs text-gray-600 leading-relaxed px-1">
              หมายเหตุ: หากบัญชี LINE หรือ Google ที่คุณจะเชื่อม
              เคยถูกใช้งานกับ SlipScan มาก่อน (เช่น เคยเปิดผ่าน LINE OA)
              จะถือว่าเป็นคนละบัญชี ไม่สามารถเชื่อมข้ามได้
            </p>
          )}
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Credits
          </p>
          <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5.5 4l-3 7L12 22l9.5-11-3-7h-13zm.5 1h12l2.4 5.6L12 19.5 3.6 10.6 6 5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Credits คงเหลือ</p>
                <p className="text-xs text-gray-500">
                  ใช้สแกนสลิปได้ {profile?.credits ?? '—'} ครั้ง
                </p>
              </div>
            </div>
            <span className="text-2xl font-semibold text-green-400 tabular-nums">
              {profile?.credits ?? '—'}
            </span>
          </div>
        </section>

        <section>
          <button
            onClick={handleSignOut}
            className="w-full py-3 rounded-xl border border-red-900 text-red-400 text-sm font-medium hover:bg-red-500/10 transition"
          >
            ออกจากระบบ
          </button>
        </section>
      </main>
    </div>
  )
}