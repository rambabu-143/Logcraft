import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createWebhook } from '@/lib/github'
import { PLAN_LIMITS } from '@/lib/stripe'
import { z } from 'zod'

// GET /api/projects — list user's projects
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { changelogs: true, subscribers: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(projects)
}

const createSchema = z.object({
  repoFullName: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
  githubRepoId: z.string(),
  publicSlug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  slackWebhookUrl: z.string().url().optional().or(z.literal('')),
  notifyEmail: z.string().email().optional().or(z.literal('')),
})

// POST /api/projects — connect a repo
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, githubAccessToken: true },
  })
  if (!user?.githubAccessToken) {
    return NextResponse.json({ error: 'GitHub token missing. Please re-authenticate.' }, { status: 403 })
  }

  // Enforce repo limit
  const repoLimit = PLAN_LIMITS[user.plan].repos
  if (repoLimit !== Infinity) {
    const count = await prisma.project.count({ where: { userId: session.user.id, isActive: true } })
    if (count >= repoLimit) {
      return NextResponse.json(
        { error: `Your ${user.plan} plan allows ${repoLimit} repo(s). Upgrade to connect more.` },
        { status: 403 },
      )
    }
  }

  // Check slug availability
  const existing = await prisma.project.findUnique({
    where: { publicSlug: parsed.data.publicSlug },
  })
  if (existing) {
    return NextResponse.json({ error: 'This slug is already taken.' }, { status: 409 })
  }

  // Create GitHub webhook
  const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/github`
  let webhookId: string | null = null

  try {
    const id = await createWebhook(
      parsed.data.repoFullName,
      webhookUrl,
      process.env.GITHUB_WEBHOOK_SECRET!,
      user.githubAccessToken,
    )
    webhookId = String(id)
  } catch (e) {
    console.error('Failed to create GitHub webhook:', e)
    // Don't block creation - user might set up webhook manually
  }

  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      repoFullName: parsed.data.repoFullName,
      githubRepoId: parsed.data.githubRepoId,
      publicSlug: parsed.data.publicSlug,
      slackWebhookUrl: parsed.data.slackWebhookUrl || null,
      notifyEmail: parsed.data.notifyEmail || null,
      webhookId,
      isActive: true,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
