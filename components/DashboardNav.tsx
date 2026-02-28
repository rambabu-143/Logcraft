'use client'

import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { Plan } from '@prisma/client'
import { useState } from 'react'

interface Props {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    plan?: Plan
  }
}

const planConfig: Record<string, { label: string; className: string }> = {
  FREE: { label: 'Free', className: 'bg-gray-100 text-gray-600' },
  STARTER: { label: 'Starter', className: 'bg-indigo-100 text-indigo-700' },
  PRO: { label: 'Pro', className: 'bg-violet-100 text-violet-700' },
}

export function DashboardNav({ user }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const plan = user.plan ?? 'FREE'
  const pc = planConfig[plan]

  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-gray-900">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="hidden sm:block">Changelogfy</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pc.className}`}>
            {pc.label}
          </span>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-50"
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? ''}
                  width={30}
                  height={30}
                  className="rounded-full ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-gray-700">{user.name}</span>
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-11 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-100 py-1.5 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <UpgradeMenuItem plan={user.plan} />
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function UpgradeMenuItem({ plan }: { plan?: Plan }) {
  const [loading, setLoading] = useState(false)

  if (plan === 'PRO') return null

  const handleUpgrade = async () => {
    setLoading(true)
    const targetPlan = plan === 'FREE' ? 'STARTER' : 'PRO'
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetPlan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors font-semibold"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3l14 9-14 9V3z" />
      </svg>
      {loading ? 'Loading…' : plan === 'FREE' ? 'Upgrade to Starter' : 'Upgrade to Pro'}
    </button>
  )
}
