'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromLiff = searchParams.get('from') === 'liff'

  useEffect(() => {
    if (fromLiff) return // ไม่ auto-close ถ้ามาจาก LIFF

    const timer = setTimeout(() => {
      window.close()
      setTimeout(() => router.push('/dashboard'), 500)
    }, 3000)
    return () => clearTimeout(timer)
  }, [fromLiff])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-medium">ชำระเงินสำเร็จ</h1>
        <p className="text-sm text-gray-400">Credits ถูกเพิ่มเข้าบัญชีของคุณแล้ว</p>

        {fromLiff ? (
          <>
            <p className="text-xs text-gray-500">กลับไป LINE เพื่อใช้งาน</p>
            <button
              onClick={() => window.close()}
              className="text-sm text-white bg-green-600 hover:bg-green-500 rounded-full px-6 py-2.5 transition font-medium"
            >
              กลับไป LINE
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-gray-600">หน้านี้จะปิดอัตโนมัติใน 3 วินาที...</p>
            <button
              onClick={() => { window.close(); router.push('/dashboard') }}
              className="text-xs text-gray-400 hover:text-white border border-gray-800 rounded-full px-4 py-2 transition"
            >
              ปิดหน้านี้
            </button>
          </>
        )}
      </div>
    </div>
  )
}