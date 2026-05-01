'use client'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-medium text-gray-800 mb-4">404</p>
        <p className="text-sm text-gray-500 mb-8">ไม่พบหน้าที่คุณต้องการ</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs text-gray-400 hover:text-white border border-gray-800 rounded-full px-4 py-2 transition"
        >
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  )
}