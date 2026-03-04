import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BackButton } from '@/components/BackButton'

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
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14]">

      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-gray-200/80 dark:border-white/[0.07] bg-white/80 dark:bg-[#0c0c14]/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton fallback={`/p/${params.slug}`} />
            <span className="text-gray-200 dark:text-white/10 select-none">|</span>
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <Link
                href={`/p/${params.slug}`}
                className="text-sm font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {projectName}
              </Link>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

        {/* Meta */}
        <div className="flex items-center gap-3 mb-3 animate-slide-up animation-fill-both">
          <span className="inline-flex items-center bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full font-mono border border-indigo-100 dark:border-indigo-500/20">
            {changelog.version}
          </span>
          <time className="text-sm text-gray-400 dark:text-gray-500">{formatted}</time>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-8 animate-slide-up animation-fill-both animation-delay-100">
          {projectName} <span className="text-gradient">{changelog.version}</span>
        </h1>

        {/* Content */}
        <div className="bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm animate-slide-up animation-fill-both animation-delay-200">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white mt-5 mb-2.5 first:mt-0 flex items-center gap-1.5">
                    {children}
                  </h2>
                ),
                ul: ({ children }) => <ul className="space-y-1.5 pl-0 list-none mb-0">{children}</ul>,
                li: ({ children }) => (
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-indigo-400 dark:text-indigo-500 mt-1 flex-shrink-0 text-xs">▸</span>
                    <span className="leading-relaxed">{children}</span>
                  </li>
                ),
                p: ({ children }) => <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                code: ({ children }) => (
                  <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
              }}
            >
              {changelog.generatedContent}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between animate-fade-in animation-delay-300 animation-fill-both">
          <Link
            href={`/p/${params.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All changelogs
          </Link>
          {showBranding && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Logo size="sm" />
              <span className="font-semibold text-gray-600 dark:text-gray-400">Logcraft</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
