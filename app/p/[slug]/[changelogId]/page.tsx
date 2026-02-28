import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  params: { slug: string; changelogId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const changelog = await prisma.changelog.findFirst({
    where: {
      id: params.changelogId,
      project: { publicSlug: params.slug },
      isPublished: true,
    },
    include: { project: true },
  })
  if (!changelog) return { title: 'Not found' }
  const name = changelog.project.repoFullName.split('/')[1]
  return { title: `${name} ${changelog.version} — Changelog` }
}

export default async function SingleChangelogPage({ params }: Props) {
  const changelog = await prisma.changelog.findFirst({
    where: {
      id: params.changelogId,
      project: { publicSlug: params.slug },
      isPublished: true,
    },
    include: { project: { select: { repoFullName: true, publicSlug: true, user: { select: { plan: true } } } } },
  })

  if (!changelog) notFound()

  const projectName = changelog.project.repoFullName.split('/')[1]
  const showBranding = changelog.project.user.plan !== 'PRO'

  const date = new Date(changelog.publishedAt ?? changelog.createdAt)
  const formatted = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            href={`/p/${params.slug}`}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            ← {projectName} changelog
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Version + date */}
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
            {changelog.version}
          </span>
          <time className="text-sm text-gray-400">{formatted}</time>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          {projectName} — {changelog.version}
        </h1>

        {/* Markdown content */}
        <div className="prose prose-gray max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {changelog.generatedContent}
          </ReactMarkdown>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link
            href={`/p/${params.slug}`}
            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ← View all changelogs
          </Link>
        </div>

        {showBranding && (
          <div className="mt-6 text-center">
            <a
              href="https://changelogfy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span>📋</span>
              Powered by Changelogfy
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
