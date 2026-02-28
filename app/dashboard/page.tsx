import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PLAN_LIMITS } from '@/lib/stripe'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const [user, projects] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, stripeCustomerId: true },
    }),
    prisma.project.findMany({
      where: { userId: session.user.id },
      include: {
        changelogs: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { changelogs: true, subscribers: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const plan = user?.plan ?? 'FREE'
  const limits = PLAN_LIMITS[plan]
  const repoLimit = limits.repos === Infinity ? '∞' : limits.repos

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            {projects.length} of {repoLimit} repos connected
          </p>
        </div>
        <div className="flex items-center gap-3">
          {plan === 'FREE' && (
            <Link
              href="/#pricing"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Upgrade plan
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          )}
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2.5 rounded-lg font-semibold transition-colors shadow-sm shadow-indigo-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Connect repo
          </Link>
        </div>
      </div>

      {/* Plan banner for FREE */}
      {plan === 'FREE' && (
        <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-900">You&apos;re on the Free plan</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              Limited to 1 repo and 10 changelogs/month. Upgrade to unlock more.
            </p>
          </div>
          <Link
            href="/#pricing"
            className="flex-shrink-0 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap"
          >
            Upgrade →
          </Link>
        </div>
      )}

      {/* Projects list */}
      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const lastChangelog = project.changelogs[0]
            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="flex items-center justify-between bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-sm p-5 transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                        {project.repoFullName}
                      </span>
                      {!project.isActive && (
                        <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          Paused
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-gray-400">/p/{project.publicSlug}</span>
                      {lastChangelog && (
                        <>
                          <span className="text-gray-200">·</span>
                          <span className="text-xs text-gray-400">
                            Last: {lastChangelog.version} ·{' '}
                            {new Date(lastChangelog.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                  <div className="hidden sm:block text-center">
                    <div className="text-base font-bold text-gray-900">{project._count.changelogs}</div>
                    <div className="text-xs text-gray-400">changelogs</div>
                  </div>
                  <div className="hidden sm:block text-center">
                    <div className="text-base font-bold text-gray-900">{project._count.subscribers}</div>
                    <div className="text-xs text-gray-400">subscribers</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Connect your first repo</h3>
      <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
        Link a GitHub repository and every push to main will generate a polished changelog automatically.
      </p>
      <Link
        href="/dashboard/projects/new"
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm shadow-indigo-100"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Connect a repo
      </Link>
    </div>
  )
}
