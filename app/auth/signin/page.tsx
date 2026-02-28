import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignInButton } from './SignInButton'

export const metadata = { title: 'Sign in' }

export default async function SignInPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <span className="text-2xl">📋</span>
        <span className="text-xl font-semibold text-gray-900">Changelogfy</span>
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-sm text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-8">
          Sign in with GitHub to manage your changelogs.
          <br />
          We request <code className="text-indigo-600 bg-indigo-50 px-1 rounded">repo</code> scope to read
          commits and create webhooks.
        </p>

        <SignInButton />

        <p className="mt-6 text-xs text-gray-400">
          By signing in you agree to our{' '}
          <span className="underline cursor-pointer">Terms</span> and{' '}
          <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>

      <Link href="/" className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← Back to home
      </Link>
    </div>
  )
}
