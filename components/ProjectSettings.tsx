'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plan } from '@prisma/client'

interface Project {
  id: string
  repoFullName: string
  publicSlug: string
  slackWebhookUrl: string | null
  notifyEmail: string | null
  isActive: boolean
  lastCommitSha: string | null
  webhookId: string | null
}

interface Props {
  project: Project
  plan: Plan
}

export function ProjectSettings({ project, plan }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(project.notifyEmail ?? '')
  const [slackWebhookUrl, setSlackWebhookUrl] = useState(project.slackWebhookUrl ?? '')
  const [isActive, setIsActive] = useState(project.isActive)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifyEmail, slackWebhookUrl, isActive }),
    })
    setSaving(false)
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 3000)
  }

  const handleDelete = async () => {
    if (!confirm(`Delete ${project.repoFullName}? All changelogs and subscribers will be removed.`)) return
    setDeleting(true)
    await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
    router.push('/dashboard')
    router.refresh()
  }

  const showSlack = plan !== 'FREE'
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/github`
    : '/api/webhooks/github'

  const inputCls = 'w-full text-sm bg-white dark:bg-white/[0.05] text-gray-900 dark:text-white border border-gray-200 dark:border-white/[0.1] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-300 dark:placeholder-gray-600 transition-shadow'

  return (
    <div className="space-y-4">
      {/* Settings form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 dark:border-white/[0.06]">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Settings</h3>
        </div>
        <div className="p-5 space-y-5">
          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Webhook active</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Pause to stop generating changelogs</div>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#0c0c14] ${isActive ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Notify email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Notification email</label>
            <input type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
          </div>

          {/* Slack */}
          {showSlack ? (
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Slack webhook</label>
              <input type="url" value={slackWebhookUrl} onChange={(e) => setSlackWebhookUrl(e.target.value)} placeholder="https://hooks.slack.com/…" className={inputCls} />
            </div>
          ) : (
            <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/[0.03] rounded-lg px-4 py-3 border border-gray-100 dark:border-white/[0.06]">
              💬 Slack notifications available on{' '}
              <span className="font-semibold text-gray-600 dark:text-gray-300">Starter</span> and{' '}
              <span className="font-semibold text-gray-600 dark:text-gray-300">Pro</span> plans
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`w-full text-sm py-2.5 rounded-lg font-semibold transition-all ${
              saved
                ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                : 'bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 disabled:opacity-50 text-white'
            }`}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save settings'}
          </button>
        </div>
      </form>

      {/* Webhook info */}
      <div className="bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 dark:border-white/[0.06]">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Webhook info</h3>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Webhook URL</div>
            <code className="text-xs bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07] rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300 break-all block font-mono">
              {webhookUrl}
            </code>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Last commit SHA</div>
            <code className="text-xs bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07] rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300 break-all block font-mono">
              {project.lastCommitSha ? project.lastCommitSha.slice(0, 12) : 'Not yet synced'}
            </code>
          </div>
          {!project.webhookId && (
            <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/[0.08] border border-amber-100 dark:border-amber-500/20 rounded-lg px-4 py-3 leading-relaxed">
              ⚠️ Webhook not auto-created. Add it manually in your GitHub repo settings pointing to the URL above, with events: <strong>push</strong> and <strong>create</strong>.
            </div>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white dark:bg-white/[0.04] rounded-xl border border-red-100 dark:border-red-500/20 overflow-hidden">
        <div className="px-5 py-4 border-b border-red-50 dark:border-red-500/10">
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400">Danger zone</h3>
        </div>
        <div className="p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Permanently delete this project and all its changelogs and subscribers. This action cannot be undone.
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/[0.08] hover:bg-red-100 dark:hover:bg-red-500/[0.14] border border-red-200 dark:border-red-500/20 py-2.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
          >
            {deleting ? 'Deleting…' : 'Delete project'}
          </button>
        </div>
      </div>
    </div>
  )
}
