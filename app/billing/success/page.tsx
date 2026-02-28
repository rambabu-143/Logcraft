import Link from 'next/link'

export const metadata = { title: 'Subscription active — Changelogfy' }

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-sm w-full">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">You&apos;re all set!</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Your subscription is now active. Go connect some repos and start generating changelogs automatically.
        </p>
        <Link
          href="/dashboard"
          className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          Go to dashboard →
        </Link>
      </div>
    </div>
  )
}
