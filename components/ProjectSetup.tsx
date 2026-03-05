'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plan } from '@prisma/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface Repo {
  id: number
  fullName: string
  private: boolean
  description: string | null
  alreadyConnected: boolean
}

interface Props {
  plan: Plan
}

export function ProjectSetup({ plan }: Props) {
  const router = useRouter()
  const [repos, setRepos] = useState<Repo[]>([])
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [repoError, setRepoError] = useState('')

  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null)
  const [slug, setSlug] = useState('')
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('')
  const [notifyEmail, setNotifyEmail] = useState('')
  const [search, setSearch] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/github/repos`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setRepoError(data.error)
        } else {
          setRepos(data)
        }
      })
      .catch(() => setRepoError('Failed to load repos'))
      .finally(() => setLoadingRepos(false))
  }, [])

  const handleSelectRepo = (repo: Repo) => {
    setSelectedRepo(repo)
    // Auto-generate slug from repo name
    const repoName = repo.fullName.split('/')[1].toLowerCase().replace(/[^a-z0-9-]/g, '-')
    setSlug(repoName)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRepo) return

    setSubmitting(true)
    setSubmitError('')

    const res = await fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoFullName: selectedRepo.fullName,
        githubRepoId: String(selectedRepo.id),
        publicSlug: slug,
        slackWebhookUrl: slackWebhookUrl || undefined,
        notifyEmail: notifyEmail || undefined,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setSubmitError(data.error ?? 'Failed to connect repo')
      setSubmitting(false)
      return
    }

    router.push(`/dashboard/projects/${data.id}`)
    router.refresh()
  }

  const filteredRepos = repos.filter((r) =>
    r.fullName.toLowerCase().includes(search.toLowerCase()),
  )

  const showSlack = plan !== 'FREE'

  // Step 1: repo selection
  if (!selectedRepo) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Select a repository</h2>

        {loadingRepos ? (
          <div className="py-8 text-center text-sm text-gray-400">Loading your repos…</div>
        ) : repoError ? (
          <div className="py-8 text-center text-sm text-red-500">{repoError}</div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Search repos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredRepos.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No repos found</p>
              )}
              {filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => !repo.alreadyConnected && handleSelectRepo(repo)}
                  disabled={repo.alreadyConnected}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${repo.alreadyConnected
                      ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{repo.fullName}</div>
                      {repo.description && (
                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                          {repo.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {repo.private && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          Private
                        </span>
                      )}
                      {repo.alreadyConnected && (
                        <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded">
                          Connected
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  // Step 2: configuration
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selected repo */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-indigo-600">✓</span>
          <span className="text-sm font-medium text-indigo-900">{selectedRepo.fullName}</span>
        </div>
        <button
          type="button"
          onClick={() => setSelectedRepo(null)}
          className="text-xs text-indigo-400 hover:text-indigo-700"
        >
          Change
        </button>
      </div>

      {/* Slug */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Public URL slug <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
            <span className="text-sm text-gray-400 bg-gray-50 px-3 py-2.5 border-r border-gray-200 whitespace-nowrap">
              logcraft.app/p/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
              }
              required
              pattern="[a-z0-9-]{2,50}"
              placeholder="my-app"
              className="flex-1 text-sm px-3 py-2.5 focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Lowercase letters, numbers, and hyphens only.</p>
        </div>

        {/* Notify email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Notification email{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="email"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            Receive a copy of each changelog at this address.
          </p>
        </div>

        {/* Slack */}
        {showSlack ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Slack webhook URL{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={slackWebhookUrl}
              onChange={(e) => setSlackWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/…"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
        ) : (
          <div className="text-sm text-gray-400 bg-gray-50 rounded-lg px-4 py-3">
            💬 Slack notifications available on{' '}
            <span className="font-medium text-gray-600">Starter</span> and{' '}
            <span className="font-medium text-gray-600">Pro</span> plans.
          </div>
        )}
      </div>

      {submitError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelectedRepo(null)}
          className="text-sm text-gray-400 hover:text-gray-700"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          {submitting ? 'Connecting…' : 'Connect repo →'}
        </button>
      </div>
    </form>
  )
}
