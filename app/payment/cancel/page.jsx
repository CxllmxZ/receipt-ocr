'use client'
import { useRouter } from 'next/navigation'

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-medium">ยกเลิกการชำระเงิน</h1>
        <p className="text-sm text-gray-400">ไม่มีการตัดเงิน — คุณสามารถลองใหม่ได้เลย</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => router.push('/pricing')}
            className="text-xs text-white bg-gray-800 hover:bg-gray-700 rounded-full px-4 py-2 transition"
          >
            ลองใหม่
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs text-gray-400 hover:text-white border border-gray-800 rounded-full px-4 py-2 transition"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    </div>
  )
}