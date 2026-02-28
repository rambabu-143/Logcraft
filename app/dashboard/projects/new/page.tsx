import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ProjectSetup } from '@/components/ProjectSetup'

export const metadata = { title: 'Connect a repo' }

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/signin')

  const [user, existingCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    }),
    prisma.project.count({ where: { userId: session.user.id, isActive: true } }),
  ])

  const plan = user?.plan ?? 'FREE'
  const repoLimit = PLAN_LIMITS[plan].repos

  // Check if plan allows more repos
  if (repoLimit !== Infinity && existingCount >= repoLimit) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Repo limit reached</h1>
        <p className="text-gray-500 mb-6">
          Your <strong>{plan}</strong> plan allows {repoLimit} repo
          {repoLimit !== 1 ? 's' : ''}. You&apos;ve used all of them.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <Link
            href="/#pricing"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            Upgrade your plan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Connect a GitHub repo</h1>
        <p className="text-sm text-gray-500 mt-1">
          We&apos;ll create a webhook on your repo to auto-generate changelogs.
        </p>
      </div>
      <ProjectSetup plan={plan} />
    </div>
  )
}
