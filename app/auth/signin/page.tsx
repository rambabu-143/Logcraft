import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignInButton } from './SignInButton'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Logo } from '@/components/Logo'
import { BackgroundOrbs } from '@/components/BackgroundOrbs'

export const metadata = { title: 'Sign in' }

export default async function SignInPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#0c0c14] flex flex-col items-center justify-center px-4 overflow-hidden">
      <BackgroundOrbs variant="subtle" />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <Logo size="md" />
        <span className="text-xl font-bold text-gray-900 dark:text-white">Logcraft</span>
      </Link>

      <div className="bg-white dark:bg-[#13131f] rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-sm p-8 w-full max-w-sm text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Welcome back</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Sign in with GitHub to manage your changelogs.
          <br />
          We request <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1 rounded">repo</code> scope to read commits and create webhooks.
        </p>

        <SignInButton />

        <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          By signing in you agree to our{' '}
          <span className="underline cursor-pointer">Terms</span> and{' '}
          <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>

      <Link href="/" className="mt-6 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        ← Back to home
      </Link>
    </div>
  )
}
