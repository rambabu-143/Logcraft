import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'
import { getCommitsSince } from '@/lib/github'
import { generateChangelog } from '@/lib/claude'
import { sendChangelogEmail } from '@/lib/email'
import { postToSlack } from '@/lib/slack'
import { PLAN_LIMITS } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

function verifyGitHubSignature(payload: string, signature: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET!
  const hmac = createHmac('sha256', secret)
  hmac.update(payload, 'utf8')
  const digest = `sha256=${hmac.digest('hex')}`

  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  } catch {
    return false
  }
}

async function getChangelogCountThisMonth(projectId: string): Promise<number> {
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  return prisma.changelog.count({
    where: { projectId, createdAt: { gte: start } },
  })
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-hub-signature-256') ?? ''
  const event = req.headers.get('x-github-event') ?? ''

  if (!verifyGitHubSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = JSON.parse(rawBody)

  // Only handle push to main/master OR tag creation
  if (event === 'push') {
    const branch = (body.ref as string)?.replace('refs/heads/', '')
    if (branch !== 'main' && branch !== 'master') {
      return NextResponse.json({ message: 'Not main/master branch, skipping' })
    }
  } else if (event === 'create') {
    if (body.ref_type !== 'tag') {
      return NextResponse.json({ message: 'Not a tag, skipping' })
    }
  } else {
    return NextResponse.json({ message: 'Unhandled event type' })
  }

  const repoId = String(body.repository?.id)

  const project = await prisma.project.findFirst({
    where: { githubRepoId: repoId, isActive: true },
    include: {
      user: { select: { githubAccessToken: true, plan: true } },
      subscribers: { where: { confirmedAt: { not: null } }, select: { email: true } },
    },
  })

  if (!project) {
    return NextResponse.json({ message: 'Project not found or inactive' })
  }

  // Enforce FREE plan changelog limit
  const plan = project.user.plan
  const limit = PLAN_LIMITS[plan].changelogsPerMonth
  if (limit !== Infinity) {
    const count = await getChangelogCountThisMonth(project.id)
    if (count >= limit) {
      console.log(`Project ${project.id} hit ${plan} changelog limit (${limit}/month)`)
      return NextResponse.json({ message: 'Monthly changelog limit reached for plan' })
    }
  }

  const latestSha: string = body.after ?? body.head_commit?.id ?? ''
  const accessToken = project.user.githubAccessToken!

  // Fetch commits since last changelog
  const commits = await getCommitsSince(project.repoFullName, project.lastCommitSha, accessToken)

  if (commits.length < 3) {
    return NextResponse.json({ message: `Only ${commits.length} commit(s), skipping (minimum 3)` })
  }

  // Determine version string
  const version =
    event === 'create' && body.ref
      ? (body.ref as string)
      : new Date().toISOString().split('T')[0]

  const projectName = project.repoFullName.split('/')[1]

  // Generate changelog with Claude
  const generatedContent = await generateChangelog(commits, projectName, version)

  // Persist changelog
  const changelog = await prisma.changelog.create({
    data: {
      projectId: project.id,
      version,
      rawCommits: commits,
      generatedContent,
      isPublished: true,
      publishedAt: new Date(),
    },
  })

  // Update lastCommitSha
  if (latestSha) {
    await prisma.project.update({
      where: { id: project.id },
      data: { lastCommitSha: latestSha },
    })
  }

  // Slack notification
  if (project.slackWebhookUrl) {
    postToSlack(project.slackWebhookUrl, {
      projectName,
      version,
      content: generatedContent,
      slug: project.publicSlug,
    }).catch((e) => console.error('Slack notification failed:', e))
  }

  // Email subscribers
  const confirmedEmails = project.subscribers.map((s) => s.email)
  if (confirmedEmails.length > 0) {
    sendChangelogEmail(confirmedEmails, {
      projectName,
      version,
      content: generatedContent,
      slug: project.publicSlug,
    }).catch((e) => console.error('Email notification failed:', e))
  }

  return NextResponse.json({ success: true, changelogId: changelog.id })
}
