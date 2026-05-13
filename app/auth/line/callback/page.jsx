'use client'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const N8N_BASE = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL?.replace(/\/upload$/, '') || 'https://n8n-production-8d4e.up.railway.app/webhook'
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_WEB_URL || 'https://receipt-ocr-rouge.vercel.app'}/auth/line/callback`

export default function LineCallbackPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [status, setStatus] = useState('กำลังเชื่อมต่อ LINE...')

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')
      const error = params.get('error')

      // Line ยกเลิก
      if (error) {
        router.replace('/settings?error=failed')
        return
      }

      // ตรวจ state (กัน CSRF)
      const savedState = sessionStorage.getItem('line_oauth_state')
      if (!state || state !== savedState) {
        router.replace('/settings?error=state_mismatch')
        return
      }
      sessionStorage.removeItem('line_oauth_state')

      if (!code) {
        router.replace('/settings?error=failed')
        return
      }

      // ดึง Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }

      setStatus('กำลังบันทึกข้อมูล...')

      try {
        const res = await fetch(`${N8N_BASE}/line-link`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code,
            redirect_uri: REDIRECT_URI
          })
        })

        const data = await res.json()

        if (res.status === 409) {
          router.replace('/settings?error=line_already_linked')
          return
        }

        if (data.success) {
          router.replace('/settings?linked=true')
        } else {
          router.replace('/settings?error=failed')
        }
      } catch {
        router.replace('/settings?error=failed')
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-[#06C755] flex items-center justify-center">
          <svg className="w-9 h-9" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15.5H7.5v-3H10V10c0-2.21 1.79-4 4-4h2.5v3H14c-.55 0-1 .45-1 1v2.5h3.5l-.5 3H13V21.8c4.56-.93 8-4.96 8-9.8C21 6.48 16.52 2 12 2z" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-700 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {status}
          </p>
        </div>
      </div>
    </div>
  )
}