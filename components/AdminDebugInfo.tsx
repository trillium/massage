'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AdminAuthManager, AdminSession } from '@/lib/adminAuth'
import { getHash } from '@/lib/hash'

interface DebugInfo {
  urlParams: {
    email: string | null
    hash: string | null
  }
  localStorage: {
    sessionExists: boolean
    sessionData: string | null
    parsedSession: AdminSession | { error: string } | null
  }
  authManager: {
    isAuthenticated: boolean
    currentEmail: string | null
    sessionValidation: AdminSession | null
  }
  validation: {
    urlValidation: string | null
    hashMatch: string | null
    sessionExpired: boolean | null
    expectedHash: string | null
    actualHash: string | null
    secretKey: string | null
  }
  timestamps: {
    current: number
    sessionTimestamp: number | null
    sessionExpiresAt: number | null
    timeUntilExpiry: string | null
  }
}

export function AdminDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const gatherDebugInfo = () => {
      const urlEmail = searchParams.get('email')
      const urlHash = searchParams.get('hash')

      // Get localStorage data
      let sessionData: string | null = null
      let parsedSession: AdminSession | { error: string } | null = null
      try {
        sessionData = localStorage.getItem('admin_session')
        parsedSession = sessionData ? JSON.parse(sessionData) : null
      } catch (error) {
        parsedSession = { error: (error as Error).message }
      }

      // Get current timestamp
      const now = Date.now()

      // Note: Validation now happens server-side for security
      const urlValidation: string = 'Server-side validation'
      const hashMatch: string = 'Server-side validation'
      const expectedHash: string = 'Hidden for security'
      const actualHash: string | null = urlHash
      const secretKey: string = 'Hidden for security (server-only)'

      const sessionExpired =
        parsedSession && 'expiresAt' in parsedSession ? now > parsedSession.expiresAt : null

      let timeUntilExpiry: string | null = null
      if (parsedSession && 'expiresAt' in parsedSession) {
        const diff = parsedSession.expiresAt - now
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          timeUntilExpiry = `${days}d ${hours}h ${minutes}m`
        } else {
          timeUntilExpiry = 'EXPIRED'
        }
      }

      const debug: DebugInfo = {
        urlParams: {
          email: urlEmail,
          hash: urlHash,
        },
        localStorage: {
          sessionExists: sessionData !== null,
          sessionData,
          parsedSession,
        },
        authManager: {
          isAuthenticated: AdminAuthManager.isAuthenticated(),
          currentEmail: AdminAuthManager.getCurrentAdminEmail(),
          sessionValidation: AdminAuthManager.validateSession(),
        },
        validation: {
          urlValidation,
          hashMatch,
          sessionExpired,
          expectedHash,
          actualHash,
          secretKey,
        },
        timestamps: {
          current: now,
          sessionTimestamp:
            parsedSession && 'timestamp' in parsedSession ? parsedSession.timestamp : null,
          sessionExpiresAt:
            parsedSession && 'expiresAt' in parsedSession ? parsedSession.expiresAt : null,
          timeUntilExpiry,
        },
      }

      setDebugInfo(debug)
    }

    gatherDebugInfo()
    // Update debug info every 5 seconds
    const interval = setInterval(gatherDebugInfo, 5000)
    return () => clearInterval(interval)
  }, [searchParams])

  if (!debugInfo) return null

  const getSessionEmail = () => {
    const session = debugInfo.localStorage.parsedSession
    if (session && 'email' in session) return session.email
    return 'null'
  }

  const getSessionHash = () => {
    const session = debugInfo.localStorage.parsedSession
    if (session && 'hash' in session) {
      return session.hash ? `${session.hash.substring(0, 16)}...` : 'null'
    }
    return 'null'
  }

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 rounded bg-yellow-500 px-3 py-1 text-xs font-bold text-black hover:bg-yellow-400"
      >
        🐛 Debug Admin Auth
      </button>

      {isVisible && (
        <div className="w-96 overflow-auto rounded border bg-black p-4 font-mono text-xs text-green-400 shadow-lg">
          <div className="mb-2 flex justify-between">
            <span className="font-bold text-yellow-400">Admin Auth Debug</span>
            <button onClick={() => setIsVisible(false)} className="text-red-400 hover:text-red-300">
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="font-bold text-blue-300">🔗 URL Parameters:</div>
              <div>Email: {debugInfo.urlParams.email || 'null'}</div>
              <div>
                Hash:{' '}
                {debugInfo.urlParams.hash
                  ? `${debugInfo.urlParams.hash.substring(0, 16)}...`
                  : 'null'}
              </div>
            </div>

            <div>
              <div className="font-bold text-blue-300">💾 localStorage:</div>
              <div>Session Exists: {debugInfo.localStorage.sessionExists ? '✅' : '❌'}</div>
              {debugInfo.localStorage.parsedSession && (
                <div>
                  <div>Email: {getSessionEmail()}</div>
                  <div>Hash: {getSessionHash()}</div>
                </div>
              )}
            </div>

            <div>
              <div className="font-bold text-blue-300">🔐 Auth Manager:</div>
              <div>Is Authenticated: {debugInfo.authManager.isAuthenticated ? '✅' : '❌'}</div>
              <div>Current Email: {debugInfo.authManager.currentEmail || 'null'}</div>
              <div>Session Valid: {debugInfo.authManager.sessionValidation ? '✅' : '❌'}</div>
            </div>

            <div>
              <div className="font-bold text-blue-300">✓ Validation:</div>
              <div>URL Validation: {debugInfo.validation.urlValidation || 'N/A'}</div>
              <div>Hash Match: {debugInfo.validation.hashMatch || 'N/A'}</div>
              <div>Expected Hash: {debugInfo.validation.expectedHash || 'N/A'}</div>
              <div>
                Actual Hash:{' '}
                {debugInfo.validation.actualHash
                  ? `${debugInfo.validation.actualHash.substring(0, 16)}...`
                  : 'null'}
              </div>
              <div>Secret Key: {debugInfo.validation.secretKey || 'N/A'}</div>
              <div>
                Session Expired:{' '}
                {debugInfo.validation.sessionExpired === true
                  ? '❌ EXPIRED'
                  : debugInfo.validation.sessionExpired === false
                    ? '✅ VALID'
                    : 'N/A'}
              </div>
            </div>

            <div>
              <div className="font-bold text-blue-300">⏰ Timing:</div>
              <div>Current: {new Date(debugInfo.timestamps.current).toLocaleString()}</div>
              {debugInfo.timestamps.sessionTimestamp && (
                <div>
                  Session Created:{' '}
                  {new Date(debugInfo.timestamps.sessionTimestamp).toLocaleString()}
                </div>
              )}
              {debugInfo.timestamps.sessionExpiresAt && (
                <div>
                  Session Expires:{' '}
                  {new Date(debugInfo.timestamps.sessionExpiresAt).toLocaleString()}
                </div>
              )}
              <div>Time Until Expiry: {debugInfo.timestamps.timeUntilExpiry || 'N/A'}</div>
            </div>

            <div className="mt-3 border-t border-gray-600 pt-2">
              <button
                onClick={() => {
                  AdminAuthManager.clearSession()
                  window.location.reload()
                }}
                className="mr-2 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
              >
                Clear Session
              </button>
              <button
                onClick={() => {
                  console.log('Full Debug Info:', debugInfo)
                  alert('Debug info logged to console')
                }}
                className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-500"
              >
                Log to Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
