'use client'

import { useState } from 'react'

interface Props {
  projectSlug: string
}

export function SubscribeForm({ projectSlug }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectSlug, email }),
      })

      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        const data = await res.json()
        setStatus('error')
        setErrorMsg(data.error ?? 'Something went wrong')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2.5 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-xl px-4 py-3">
        <span className="text-base">✅</span>
        <span>You&apos;re subscribed! We&apos;ll email you on each new release.</span>
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 text-sm border border-gray-200 dark:border-white/[0.1] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-600 bg-white dark:bg-white/[0.05] text-gray-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors whitespace-nowrap"
        >
          {status === 'loading' ? '…' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-500">{errorMsg}</p>
      )}
    </div>
  )
}
