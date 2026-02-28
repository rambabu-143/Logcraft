import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DEMO_CHANGELOG = `## ✨ New Features
- **Dark mode** — Full dark mode support across all dashboard views
- **API access** — New endpoint for programmatic changelog creation
- **Webhook retry** — Exponential backoff on failed deliveries

## 🐛 Bug Fixes
- Fixed login redirect loop on expired sessions
- Corrected timezone handling in changelog timestamps
- Resolved subscriber email deduplication issue

## 🔧 Improvements
- Changelog generation is now 40% faster
- Better commit grouping accuracy for monorepos
- Clearer error messages when GitHub token expires`

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-gray-900">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">C</span>
            </div>
            <span>Changelogfy</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="#how-it-works" className="hidden sm:block text-sm text-gray-500 hover:text-gray-900 transition-colors">
              How it works
            </Link>
            <Link href="#pricing" className="hidden sm:block text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            {session ? (
              <Link
                href="/dashboard"
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Dashboard →
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sign in with GitHub
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Powered by Claude AI
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">
              Changelogs that{' '}
              <span className="text-indigo-600">write themselves</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Connect your GitHub repo. Push to main. Get a beautiful, AI-generated changelog
              published instantly — no manual writing, no missed commits.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                Get started — it&apos;s free
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 px-6 py-3.5 rounded-xl font-medium text-base transition-colors"
              >
                See how it works ↓
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-400">No credit card required · Free forever plan available</p>
          </div>

          {/* Demo Window */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-gray-400 font-mono">changelogfy.com/p/my-saas</span>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                      v2.4.0
                    </span>
                    <span className="text-xs bg-green-50 text-green-600 font-medium px-2.5 py-1 rounded-full border border-green-100">
                      Latest
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">Jan 15, 2025</span>
                </div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-7">
                  {DEMO_CHANGELOG}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <div className="border-y border-gray-100 bg-gray-50 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs text-gray-400 font-medium tracking-wide uppercase">
            Works with any GitHub repository · Takes 2 minutes to set up · No config files needed
          </p>
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Set up in 2 minutes</h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">Three steps to never write a changelog again.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                ),
                title: 'Connect your repo',
                description: 'Sign in with GitHub and select any repository. Changelogfy creates a webhook automatically — no manual setup.',
              },
              {
                step: '02',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                  </svg>
                ),
                title: 'Push to main',
                description: 'Every push to main or git tag triggers the magic. Claude reads your commits and groups them intelligently.',
              },
              {
                step: '03',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Published instantly',
                description: 'A polished changelog appears at your public URL, emailed to subscribers, and posted to Slack — automatically.',
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="absolute top-4 right-4 text-2xl font-black text-gray-100 select-none">{item.step}</div>
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🤖', label: 'AI-generated', desc: 'Claude transforms technical commits into readable, user-friendly prose' },
              { icon: '📧', label: 'Email subscribers', desc: 'Users subscribe to your changelog and get notified on every release' },
              { icon: '💬', label: 'Slack alerts', desc: 'Post changelog summaries to any Slack channel automatically' },
              { icon: '🌐', label: 'Public URL', desc: 'Beautiful hosted changelog page ready to share with your users' },
            ].map((f) => (
              <div key={f.label} className="bg-indigo-500/40 backdrop-blur rounded-xl p-5 border border-indigo-400/30">
                <div className="text-2xl mb-3">{f.icon}</div>
                <div className="font-semibold text-white mb-1">{f.label}</div>
                <div className="text-sm text-indigo-200 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Simple, honest pricing</h2>
            <p className="mt-3 text-gray-500">No seats. No surprises. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 p-7 flex flex-col">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Free</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-gray-900">$0</span>
                </div>
                <div className="text-sm text-gray-400 mb-8">forever</div>
                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  {[
                    '1 repository',
                    '10 changelogs / month',
                    'Public changelog page',
                    'GitHub webhook',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/auth/signin"
                className="mt-auto block text-center w-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                Get started free
              </Link>
            </div>

            {/* Starter */}
            <div className="rounded-2xl border-2 border-indigo-500 p-7 relative flex flex-col bg-indigo-50/30">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                  Most popular
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Starter</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-gray-900">$9</span>
                  <span className="text-gray-400 mb-1.5">/ mo</span>
                </div>
                <div className="text-sm text-gray-400 mb-8">billed monthly</div>
                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  {[
                    '3 repositories',
                    '50 changelogs / month',
                    'Email subscribers (100)',
                    'Slack notifications',
                    'Everything in Free',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/auth/signin"
                className="mt-auto block text-center w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                Get started
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border border-gray-200 p-7 flex flex-col bg-gray-900">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pro</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-white">$19</span>
                  <span className="text-gray-500 mb-1.5">/ mo</span>
                </div>
                <div className="text-sm text-gray-500 mb-8">billed monthly</div>
                <ul className="space-y-3 text-sm text-gray-400 mb-8">
                  {[
                    'Unlimited repositories',
                    '200 changelogs / month',
                    'Unlimited subscribers',
                    'Custom domain (CNAME)',
                    'Remove Changelogfy branding',
                    'Everything in Starter',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/auth/signin"
                className="mt-auto block text-center w-full bg-white hover:bg-gray-100 text-gray-900 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-4xl mb-6">🚀</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ship and document simultaneously</h2>
          <p className="mt-4 text-gray-400 text-lg">
            Your next commit could be the last time you forget to update the changelog.
          </p>
          <Link
            href="/auth/signin"
            className="mt-10 inline-flex items-center gap-2.5 bg-white hover:bg-gray-100 text-gray-900 font-bold px-7 py-3.5 rounded-xl transition-colors shadow-xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub — free forever
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="text-sm font-semibold text-white">Changelogfy</span>
            <span className="text-sm text-gray-500">— AI-powered changelogs</span>
          </div>
          <div className="text-sm text-gray-600">
            Built with Claude AI · {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  )
}
