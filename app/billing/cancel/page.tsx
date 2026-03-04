import Link from 'next/link'

export const metadata = { title: 'Checkout cancelled — Logcraft' }

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-white dark:bg-[#13131f] rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-sm p-10 max-w-sm w-full">
        <div className="w-16 h-16 bg-gray-100 dark:bg-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Checkout cancelled</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
          No worries — you can upgrade anytime from your dashboard when you&apos;re ready.
        </p>
        <Link
          href="/dashboard"
          className="block w-full bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
