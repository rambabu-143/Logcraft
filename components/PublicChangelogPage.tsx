'use client'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { SubscribeForm } from './SubscribeForm'
import { ThemeToggle } from './ThemeToggle'
import { BackButton } from './BackButton'
import { Logo } from './Logo'
import { Plan } from '@prisma/client'

interface Changelog {
  id: string
  version: string
  generatedContent: string
  publishedAt: string
  createdAt: string
}

interface Project {
  id: string
  repoFullName: string
  publicSlug: string
  plan: Plan
}

interface Props {
  project: Project
  changelogs: Changelog[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const days = Math.floor(ms / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export function PublicChangelogPage({ project, changelogs }: Props) {
  const projectName = project.repoFullName.split('/')[1]
  const showBranding = project.plan !== 'PRO'
  const showSubscribe = project.plan !== 'FREE'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] font-sans">

      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-gray-200/80 dark:border-white/[0.07] bg-white/80 dark:bg-[#0c0c14]/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: back + logo */}
          <div className="flex items-center gap-3 min-w-0">
            <BackButton />
            <span className="text-gray-200 dark:text-white/10 select-none">|</span>
            <div className="flex items-center gap-2 min-w-0">
              <Logo size="sm" />
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{projectName}</span>
              <span className="text-gray-300 dark:text-white/20">/</span>
              <span className="text-sm text-gray-400 dark:text-gray-500">changelog</span>
            </div>
          </div>

          {/* Right: github + theme */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href={`https://github.com/${project.repoFullName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

        {/* Hero */}
        <div className="mb-10 animate-slide-up animation-fill-both">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              AI-generated
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            What&apos;s new in{' '}
            <span className="text-gradient">{projectName}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            {changelogs.length} release{changelogs.length !== 1 ? 's' : ''} · generated from git commits
          </p>
        </div>

        {/* Subscribe */}
        {showSubscribe && (
          <div className="mb-10 animate-slide-up animation-fill-both animation-delay-100 glass-card p-5">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-0.5">Stay up to date</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Get notified when {projectName} ships a new update.
                </p>
                <SubscribeForm projectSlug={project.publicSlug} />
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {changelogs.length === 0 && (
          <div className="text-center py-24 animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/[0.05] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-semibold">No changelogs yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back after the next release.</p>
          </div>
        )}

        {/* Timeline */}
        {changelogs.length > 0 && (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-6 bottom-6 w-px bg-gradient-to-b from-indigo-300 via-gray-200 to-transparent dark:from-indigo-500/30 dark:via-white/10 dark:to-transparent" />

            <div className="space-y-6">
              {changelogs.map((changelog, index) => (
                <div
                  key={changelog.id}
                  className="relative pl-8 animate-slide-up animation-fill-both"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 top-5 w-[23px] h-[23px] rounded-full border-2 flex items-center justify-center z-10 transition-transform hover:scale-110 ${
                      index === 0
                        ? 'bg-indigo-600 border-indigo-600 animate-pulse-glow'
                        : 'bg-white dark:bg-[#0c0c14] border-gray-200 dark:border-white/20'
                    }`}
                  >
                    {index === 0 && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  {/* Card */}
                  <div className="glass-card glass-card-hover overflow-hidden group">
                    {/* Card header */}
                    <div className="px-5 py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <Link href={`/p/${project.publicSlug}/${changelog.id}`}>
                          <span
                            className={`inline-flex items-center font-bold text-xs px-2.5 py-1 rounded-md transition-all hover:scale-105 font-mono ${
                              index === 0
                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                                : 'bg-gray-100 dark:bg-white/[0.07] text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {changelog.version}
                          </span>
                        </Link>
                        {index === 0 && (
                          <span className="text-xs bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-semibold px-2 py-0.5 rounded-full border border-green-100 dark:border-green-500/20">
                            Latest
                          </span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {formatDate(changelog.publishedAt)}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(changelog.publishedAt)}</div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 dark:bg-white/[0.05] mx-5" />

                    {/* Content */}
                    <div className="px-5 py-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h2: ({ children }) => (
                              <h2 className="text-sm font-bold text-gray-900 dark:text-white mt-5 mb-2.5 first:mt-0 flex items-center gap-1.5">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-1.5">{children}</h3>
                            ),
                            ul: ({ children }) => (
                              <ul className="space-y-1.5 pl-0 list-none mb-0">{children}</ul>
                            ),
                            li: ({ children }) => (
                              <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-indigo-400 dark:text-indigo-500 mt-1 flex-shrink-0 text-xs">▸</span>
                                <span className="leading-relaxed">{children}</span>
                              </li>
                            ),
                            p: ({ children }) => (
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
                            ),
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
                    <div className="px-5 py-3 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-end">
                      <Link
                        href={`/p/${project.publicSlug}/${changelog.id}`}
                        className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
                      >
                        Permalink →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Branding */}
        {showBranding && (
          <div className="mt-16 pt-8 border-t border-gray-100 dark:border-white/[0.06] text-center animate-fade-in animation-delay-500 animation-fill-both">
            <span className="inline-flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <Logo size="sm" />
              Powered by <strong className="font-semibold text-gray-600 dark:text-gray-400">Logcraft</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
