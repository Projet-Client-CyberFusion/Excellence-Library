'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Silently rotate the API session while the reader keeps browsing. */
export function SessionKeeper() {
  const router = useRouter()

  useEffect(() => {
    let active = true
    const refreshIfNeeded = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        const response = await fetch('/api/auth/session', { method: 'POST', cache: 'no-store' })
        const result = await response.json() as { refreshed?: boolean }
        if (active && result.refreshed) router.refresh()
      } catch {
        // A temporary network issue should leave the current session untouched.
      }
    }
    void refreshIfNeeded()
    const interval = window.setInterval(() => void refreshIfNeeded(), 20 * 60 * 1000)
    document.addEventListener('visibilitychange', refreshIfNeeded)
    return () => {
      active = false
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', refreshIfNeeded)
    }
  }, [router])

  return null
}
