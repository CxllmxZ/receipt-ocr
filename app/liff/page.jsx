'use client'
import { useState } from 'react'
import { useLiff } from '@/hooks/useLiff'

export default function LiffPage() {
  const { accessToken, profile, ready } = useLiff()
  const [result, setResult] = useState(null)
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !accessToken) return

    setUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setUploading(false)
    }
  }

  if (!ready) return <div className="p-4">กำลังโหลด...</div>

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-md mx-auto space-y-4">
        {profile && (
          <div className="flex items-center gap-3">
            <img src={profile.pictureUrl} className="w-10 h-10 rounded-full" />
            <span>สวัสดี {profile.displayName}</span>
          </div>
        )}

        <label className="block w-full bg-green-600 text-center py-4 rounded-xl cursor-pointer">
          {uploading ? 'กำลังประมวลผล...' : 'อัปโหลดสลิป'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {result && (
          <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}