'use client'

import { useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  changelog: {
    id: string
    version: string
    generatedContent: string
    isPublished: boolean
    publishedAt: Date | null
    createdAt: Date
  }
  projectSlug: string
}

export function ChangelogCard({ changelog, projectSlug }: Props) {
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (deleted) return null

  const handleDelete = async () => {
    if (!confirm('Delete this changelog? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/changelogs/${changelog.id}`, { method: 'DELETE' })
    setDeleted(true)
  }

  const date = new Date(changelog.publishedAt ?? changelog.createdAt)
  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg font-mono">
            {changelog.version}
          </span>
          <span className="text-xs text-gray-400">{formatted}</span>
          {!changelog.isPublished && (
            <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-medium">
              Draft
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/p/${projectSlug}/${changelog.id}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors font-medium"
          >
            View
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 font-medium"
          >
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`px-5 py-4 overflow-hidden transition-all duration-200 ${expanded ? '' : 'max-h-48'}`}>
        <div className="prose prose-sm prose-gray max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="text-xs font-bold text-gray-700 mt-4 mb-2 first:mt-0 uppercase tracking-wide">{children}</h2>
              ),
              ul: ({ children }) => <ul className="space-y-1 pl-3 mb-3">{children}</ul>,
              li: ({ children }) => (
                <li className="text-xs text-gray-500 leading-relaxed list-disc">{children}</li>
              ),
              p: ({ children }) => <p className="text-xs text-gray-500 leading-relaxed">{children}</p>,
            }}
          >
            {changelog.generatedContent}
          </ReactMarkdown>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-2.5 text-xs text-gray-400 hover:text-gray-600 transition-colors border-t border-gray-50 bg-gray-50/50 hover:bg-gray-50 flex items-center justify-center gap-1"
      >
        {expanded ? 'Show less ↑' : 'Show more ↓'}
      </button>
    </div>
  )
}
