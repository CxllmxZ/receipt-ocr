'use client'
import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // 'login' | 'signup'

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setInfo('เช็ค email เพื่อยืนยันการสมัคร')
    setLoading(false)
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) setError(error.message)
  }

  const isLogin = mode === 'login'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 pb-safe">
      <div className="w-full max-w-[400px] space-y-5">

        {/* logo */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <svg width="180" height="38" viewBox="0 0 200 48" xmlns="http://www.w3.org/2000/svg" aria-label="SlipScan">
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0"/>
                <stop offset="50%" stopColor="#22c55e" stopOpacity="1"/>
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <g transform="translate(21, 0)">
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
            </g>
          </svg>
          <p className="text-sm text-gray-500">สแกนใบเสร็จ · จัดการสลิป · ในคลิกเดียว</p>
        </div>

        {/* tab toggle */}
        <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1">
          <button
            onClick={() => { setMode('login'); setError(''); setInfo('') }}
            className={`flex-1 py-2 text-sm rounded-lg transition font-medium ${isLogin ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); setInfo('') }}
            className={`flex-1 py-2 text-sm rounded-lg transition font-medium ${!isLogin ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* form */}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-gray-600 text-white text-base outline-none transition"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-gray-900 border border-gray-800 focus:border-gray-600 text-white text-base outline-none transition"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {info && (
            <p className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              {info}
            </p>
          )}

          <button
            onClick={isLogin ? handleLogin : handleSignup}
            disabled={loading || !email || !password}
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 text-white py-3.5 rounded-xl text-sm font-medium transition"
          >
            {loading ? 'กำลังโหลด...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </div>

        {/* divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-800"/>
          <span className="text-xs text-gray-600">หรือ</span>
          <div className="flex-1 h-px bg-gray-800"/>
        </div>

        {/* google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-100 text-gray-900 py-3.5 rounded-xl text-sm font-medium transition"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          เข้าสู่ระบบด้วย Google
        </button>

        {/* footer links */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => router.push('/forgot-password')}
            className="text-xs text-gray-600 hover:text-gray-400 transition"
          >
            ลืมรหัสผ่าน?
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <button onClick={() => router.push('/privacy')} className="hover:text-gray-400 transition">Privacy</button>
            <span>·</span>
            <button onClick={() => router.push('/terms')} className="hover:text-gray-400 transition">Terms</button>
          </div>
        </div>

      </div>
    </div>
  )
}