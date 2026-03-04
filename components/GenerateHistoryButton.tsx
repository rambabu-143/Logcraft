'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Phase = 'idle' | 'thinking' | 'streaming' | 'done' | 'error'

export function GenerateHistoryButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  const [display, setDisplay] = useState('')   // content shown to user (no think tags)
  const [thinkText, setThinkText] = useState('') // reasoning text (shown collapsed)
  const [error, setError] = useState<string | null>(null)
  const [showThinking, setShowThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phase === 'streaming') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [display, phase])

  const handleGenerate = async () => {
    setPhase('thinking')
    setDisplay('')
    setThinkText('')
    setError(null)
    setShowThinking(false)

    try {
      const res = await fetch(`/api/projects/${projectId}/generate-history`, { method: 'POST' })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Request failed')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let rawAccum = ''     // full raw text for think-tag state tracking
      let inThink = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue

          let event: { type: string; text?: string; message?: string }
          try { event = JSON.parse(raw) } catch { continue }

          if (event.type === 'chunk' && event.text) {
            rawAccum += event.text

            // Parse the running raw text for think blocks
            // Determine what to show vs what's "thinking"
            let visible = ''
            let thinking = ''
            let temp = rawAccum
            let isThinking = false

            // Simple state machine over full accumulated text
            let i = 0
            while (i < temp.length) {
              if (!isThinking && temp.slice(i, i + 7) === '<think>') {
                isThinking = true
                i += 7
              } else if (isThinking && temp.slice(i, i + 8) === '</think>') {
                isThinking = false
                i += 8
              } else if (isThinking) {
                thinking += temp[i]
                i++
              } else {
                visible += temp[i]
                i++
              }
            }

            inThink = isThinking
            const cleanVisible = visible.trimStart()

            setThinkText(thinking)
            setDisplay(cleanVisible)

            if (cleanVisible.length > 0) {
              setPhase('streaming')
            } else {
              setPhase('thinking')
            }
          } else if (event.type === 'done') {
            setPhase('done')
            setTimeout(() => router.refresh(), 1000)
          } else if (event.type === 'error') {
            throw new Error(event.message ?? 'Generation failed')
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setPhase('error')
    }
  }

  const isRunning = phase === 'thinking' || phase === 'streaming'

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Trigger button */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={isRunning}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          {isRunning ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {phase === 'idle' || phase === 'error'
            ? 'Generate from existing commits'
            : phase === 'thinking'
            ? 'Thinking…'
            : phase === 'streaming'
            ? 'Generating…'
            : '✓ Done'}
        </button>
      </div>

      {/* Thinking collapsible */}
      {(phase === 'thinking' || phase === 'streaming' || phase === 'done') && (
        <div className="rounded-xl border border-amber-100 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/[0.07] overflow-hidden animate-fade-in">
          <button
            onClick={() => setShowThinking((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-400"
          >
            <span className="flex items-center gap-2">
              {phase === 'thinking' && (
                <span className="flex gap-1">
                  <span className="w-1 h-1 rounded-full bg-amber-500 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1 h-1 rounded-full bg-amber-500 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1 h-1 rounded-full bg-amber-500 animate-bounce [animation-delay:300ms]" />
                </span>
              )}
              {phase === 'thinking' ? 'AI is reasoning…' : 'Reasoning complete'}
            </span>
            <span className="text-amber-400">{showThinking ? '▲ hide' : '▼ show'}</span>
          </button>
          {showThinking && thinkText && (
            <div className="px-4 pb-3 text-xs text-amber-700/70 dark:text-amber-400/60 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto border-t border-amber-100 dark:border-amber-500/20 pt-2">
              {thinkText}
            </div>
          )}
        </div>
      )}

      {/* Live output */}
      {(phase === 'streaming' || phase === 'done') && display && (
        <div className="border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/[0.05]">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {phase === 'streaming' ? 'Generating…' : 'Generated ✓'}
            </span>
            {phase === 'streaming' && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </div>
          <div className="p-4 max-h-72 overflow-y-auto">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white mt-4 mb-2 first:mt-0 flex items-center gap-1.5">{children}</h2>
                  ),
                  ul: ({ children }) => <ul className="space-y-1.5 pl-0 list-none">{children}</ul>,
                  li: ({ children }) => (
                    <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-indigo-400 mt-1 text-xs flex-shrink-0">▸</span>
                      <span className="leading-relaxed">{children}</span>
                    </li>
                  ),
                  p: ({ children }) => <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                }}
              >
                {display}
              </ReactMarkdown>
              {phase === 'streaming' && (
                <span className="inline-block w-0.5 h-4 bg-indigo-500 animate-pulse ml-0.5 align-middle" />
              )}
            </div>
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && error && (
        <p className="text-xs text-red-500 dark:text-red-400 px-1">{error}</p>
      )}
    </div>
  )
}
