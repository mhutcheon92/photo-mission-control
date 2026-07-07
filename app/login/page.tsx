'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get('from') ?? '/'

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push(from)
    } else {
      setError('Incorrect password.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Mark */}
        <div style={{ marginBottom: 48 }}>
          <span style={{
            fontFamily: 'var(--font-serif, Cormorant Garamond, serif)',
            fontSize: '1.1rem', fontWeight: 400, letterSpacing: '0.08em',
            color: 'var(--text-2)',
          }}>
            Michael Hutcheon
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif, DM Serif Display, serif)',
          fontSize: 30, marginBottom: 8, color: 'var(--text)',
        }}>
          Photo Mission Control
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 32 }}>
          Enter the portal password to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: '100%', padding: '12px 14px',
              background: 'var(--bg2)', border: `1px solid ${error ? 'var(--danger)' : 'var(--border-med)'}`,
              borderRadius: 8, color: 'var(--text)', fontSize: 15,
              outline: 'none', marginBottom: 8,
            }}
          />
          {error && (
            <p style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 12 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={!password || loading}
            style={{
              width: '100%', padding: '12px',
              background: password && !loading ? 'var(--red)' : 'var(--bg4)',
              border: 'none', borderRadius: 8,
              color: password && !loading ? '#fff' : 'var(--text-3)',
              fontSize: 14, fontWeight: 600,
              cursor: password && !loading ? 'pointer' : 'not-allowed',
              transition: 'background .15s',
            }}
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
