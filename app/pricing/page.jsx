'use client'
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import { useEffect, useState } from 'react'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 1,
    credits: 100,
    bonus: 0,
    desc: 'เหมาะสำหรับทดลองใช้',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 5,
    credits: 500,
    bonus: 50,
    desc: 'ยอดนิยม คุ้มที่สุด',
    highlight: true,
  },
  {
    id: 'whale',
    name: 'Whale',
    price: 10,
    credits: 1000,
    bonus: 200,
    desc: 'สำหรับคนใช้เยอะ',
    highlight: false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [buyingPlan, setBuyingPlan] = useState(null) // track loading state per plan

  useEffect(() => {
    checkSession()

    const handleFocus = () => {
      checkSession()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    setUser(session.user)

    const { data } = await supabase
      .from('users')
      .select('credits')
      .eq('id', session.user.id)
      .single()

    setCredits(data?.credits ?? 0)
    setLoading(false)
  }

  async function handleBuy(plan) {
    try {
      setBuyingPlan(plan.id)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const res = await fetch('https://n8n-production-8d4e.up.railway.app/webhook/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.user.id,
          plan: plan.id,
        }),
      })

      if (!res.ok) throw new Error('create checkout failed')

      const data = await res.json()

      // n8n อาจส่งกลับมาเป็น array หรือ object
      const checkoutUrl = Array.isArray(data) ? data[0].url : data.checkout_url

      if (!checkoutUrl) throw new Error('no checkout url')

      const newWindow = window.open(checkoutUrl, '_blank', 'noopener,noreferrer')
      if (newWindow) newWindow.opener = null

    } catch (err) {
      console.error(err)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setBuyingPlan(null)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <p className="text-gray-400 text-sm">กำลังโหลด...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-safe">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-12">

        {/* header */}
        <div className="flex justify-between items-center mb-8 sm:mb-12">
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
            </svg>
            กลับ
          </button>
          <span className="text-xs text-gray-400 bg-gray-900 border border-gray-800 rounded-full px-3 py-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 mb-0.5"></span>
            {credits} credits คงเหลือ
          </span>
        </div>

        {/* title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl font-medium mb-2">เติม Credits</h1>
          <p className="text-sm text-gray-500">ซื้อครั้งเดียว ไม่มีรายเดือน ใช้ได้ไม่มีหมดอายุ</p>
        </div>

        {/* plans */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-5 sm:p-6 flex sm:flex-col gap-4 transition ${
                plan.highlight
                  ? 'bg-white text-gray-950 border-2 border-white'
                  : 'bg-gray-900 border border-gray-800 text-white'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-950 text-white text-xs px-3 py-1 rounded-full border border-gray-700 whitespace-nowrap">
                  ยอดนิยม
                </div>
              )}

              <div className="flex-1 flex sm:flex-col gap-3 sm:gap-4">
                <div className="flex-1">
                  <p className="text-xs font-medium mb-1 text-gray-500">{plan.name}</p>
                  <p className="text-3xl font-medium">${plan.price}</p>
                </div>

                <div className={`text-sm ${plan.highlight ? 'text-gray-700' : 'text-gray-400'}`}>
                  <p className="font-medium text-base mb-1" style={{ color: plan.highlight ? '#111' : '#fff' }}>
                    {(plan.credits + plan.bonus).toLocaleString()} credits
                  </p>
                  {plan.bonus > 0 && (
                    <p className="text-xs">
                      {plan.credits.toLocaleString()} + <span className="text-green-500 font-medium">+{plan.bonus} โบนัส</span>
                    </p>
                  )}
                  <p className="text-xs mt-1 opacity-60">{plan.desc}</p>
                </div>
              </div>

              <button
                onClick={() => handleBuy(plan)}
                disabled={buyingPlan === plan.id}
                className={`sm:w-full py-3 px-5 sm:px-0 rounded-xl text-sm font-medium transition flex-shrink-0 self-center sm:self-auto disabled:opacity-50 ${
                  plan.highlight
                    ? 'bg-gray-950 text-white hover:bg-gray-800'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {buyingPlan === plan.id ? 'กำลังโหลด...' : 'ซื้อเลย'}
              </button>
            </div>
          ))}
        </div>

        {/* note */}
        <div className="text-center space-y-2 mb-4">
          <p className="text-xs text-gray-600">Credits ไม่มีวันหมดอายุ · ใช้ได้ทันทีหลังชำระเงิน</p>
          <p className="text-xs text-gray-700">สมัครใหม่รับฟรี 20 credits ทันที</p>
          <p className="text-xs text-gray-700">
            มีคำถาม?{' '}
            <button onClick={() => router.push('/support')} className="text-gray-500 hover:text-gray-300 underline">
              ติดต่อเรา
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}