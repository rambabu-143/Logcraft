import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProjectSettings } from '@/components/ProjectSettings'
import { ChangelogCard } from '@/components/ChangelogCard'
import { GenerateHistoryButton } from '@/components/GenerateHistoryButton'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } })
  return { title: project ? project.repoFullName : 'Project' }
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      changelogs: { orderBy: { createdAt: 'desc' } },
      subscribers: { orderBy: { createdAt: 'desc' }, take: 10 },
      _count: { select: { changelogs: true, subscribers: true } },
    },
  })

  if (!project) notFound()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  const plan = user?.plan ?? 'FREE'

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          ← Dashboard
        </Link>
        <div className="flex items-center justify-between mt-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.repoFullName}</h1>
            <div className="flex items-center gap-3 mt-1">
              <a
                href={`${process.env.NEXTAUTH_URL ?? ''}/p/${project.publicSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                /p/{project.publicSlug} ↗
              </a>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {project._count.changelogs} changelogs · {project._count.subscribers} subscribers
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Changelogs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Changelog history</h2>
            <GenerateHistoryButton projectId={project.id} />
          </div>
          {project.changelogs.length === 0 ? (
            <div className="bg-white dark:bg-white/[0.04] rounded-xl border border-dashed border-gray-200 dark:border-white/[0.1] p-8 text-center space-y-3">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No changelogs yet. Push to your main branch or generate from existing commits.
              </p>
              <GenerateHistoryButton projectId={project.id} />
            </div>
          ) : (
            project.changelogs.map((cl) => (
              <ChangelogCard key={cl.id} changelog={cl} projectSlug={project.publicSlug} />
            ))
          )}
        </div>

        {/* Settings sidebar */}
        <div className="space-y-4">
          <ProjectSettings project={project} plan={plan} />
        </div>
      </div>
    </div>
  )
}
