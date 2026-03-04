import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCommitsSince } from '@/lib/github'
import { PLAN_LIMITS } from '@/lib/stripe'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.ZHIPUAI_API_KEY!,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
})

async function getChangelogCountThisMonth(projectId: string): Promise<number> {
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)
  return prisma.changelog.count({ where: { projectId, createdAt: { gte: start } } })
}

const SYSTEM_PROMPT = `You are a product writer who transforms technical git commits into polished, user-friendly changelogs.

## Categories (only include those with items)
- ✨ New Features — new capabilities or functionality
- 🔧 Improvements — enhancements to existing features, performance wins, UX refinements
- 🐛 Bug Fixes — corrections to defects or edge cases
- ⚠️ Breaking Changes — changes that require user action
- 🔒 Security — security patches, auth improvements

## Rules
- Focus on what changed FOR THE USER, not how it was implemented
- Use active voice and present tense
- Bold the feature/fix name, then explain briefly
- Group related commits into one entry
- EXCLUDE: merge commits, version bumps, chore:/test:/docs: prefixes

Return ONLY the markdown changelog, no preamble.`

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { user: { select: { githubAccessToken: true, plan: true } } },
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const plan = project.user.plan
  const limit = PLAN_LIMITS[plan].changelogsPerMonth
  if (limit !== Infinity) {
    const count = await getChangelogCountThisMonth(project.id)
    if (count >= limit) {
      return NextResponse.json({ error: `Monthly limit reached (${limit}/month on ${plan} plan)` }, { status: 429 })
    }
  }

  const accessToken = project.user.githubAccessToken
  if (!accessToken) {
    return NextResponse.json({ error: 'No GitHub access token' }, { status: 400 })
  }

  let commits: string[]
  try {
    commits = await getCommitsSince(project.repoFullName, null, accessToken)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch commits'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  if (commits.length === 0) {
    return NextResponse.json({ error: 'No commits found in this repository' }, { status: 400 })
  }

  const projectName = project.repoFullName.split('/')[1]
  const version = new Date().toISOString().split('T')[0]
  const commitList = commits.map((c) => `- ${c}`).join('\n')
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const send = (obj: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))

      try {
        const stream = await client.chat.completions.create({
          model: 'glm-4.7-flash',
          max_tokens: 2048,
          stream: true,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Generate a changelog from these commits:\n${commitList}\n\nProject: ${projectName}\nVersion: ${version}`,
            },
          ],
        })

        let fullText = ''

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? ''
          if (!delta) continue
          fullText += delta
          // Send every chunk immediately — client handles <think> filtering
          send({ type: 'chunk', text: delta })
        }

        // Strip think blocks and save
        const clean = fullText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

        const changelog = await prisma.changelog.create({
          data: {
            projectId: project.id,
            version,
            rawCommits: commits,
            generatedContent: clean,
            isPublished: true,
            publishedAt: new Date(),
          },
        })

        send({ type: 'done', changelogId: changelog.id })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Generation failed'
        send({ type: 'error', message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
