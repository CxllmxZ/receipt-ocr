import { useEffect, useState } from 'react'

export function useLiff() {
  const [lineUserId, setLineUserId] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [profile, setProfile] = useState(null)
  const [ready, setReady] = useState(false)
  const [isLiff, setIsLiff] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const liff = (await import('@line/liff')).default
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID })
        
        setIsLiff(liff.isInClient())

        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }

        const token = liff.getAccessToken()
        const userProfile = await liff.getProfile()

        setAccessToken(token)
        setLineUserId(userProfile.userId)
        setProfile(userProfile)
        setReady(true)
      } catch (err) {
        console.error('LIFF init error:', err)
        setReady(true)
      }
    }

    init()
  }, [])

  return { lineUserId, accessToken, profile, ready, isLiff }
}