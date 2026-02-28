import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const subscribeSchema = z.object({
  projectSlug: z.string(),
  email: z.string().email(),
})

// POST /api/subscribers — subscribe to a project's changelog
export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = subscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email or project' }, { status: 400 })
  }

  const project = await prisma.project.findUnique({
    where: { publicSlug: parsed.data.projectSlug },
    include: { user: { select: { plan: true } } },
  })

  if (!project || !project.isActive) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Enforce subscriber limits
  const plan = project.user.plan
  if (plan === 'FREE') {
    return NextResponse.json(
      { error: 'This project does not accept email subscribers.' },
      { status: 403 },
    )
  }

  if (plan === 'STARTER') {
    const count = await prisma.subscriber.count({ where: { projectId: project.id } })
    if (count >= 100) {
      return NextResponse.json(
        { error: 'This project has reached its subscriber limit.' },
        { status: 403 },
      )
    }
  }

  // Upsert — silently succeed if already subscribed
  await prisma.subscriber.upsert({
    where: { projectId_email: { projectId: project.id, email: parsed.data.email } },
    update: {},
    create: {
      projectId: project.id,
      email: parsed.data.email,
      confirmedAt: new Date(), // Immediate confirm (no double opt-in for MVP)
    },
  })

  return NextResponse.json({ success: true })
}

// DELETE /api/subscribers?projectSlug=xxx&email=xxx — unsubscribe
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectSlug = searchParams.get('projectSlug')
  const email = searchParams.get('email')

  if (!projectSlug || !email) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const project = await prisma.project.findUnique({ where: { publicSlug: projectSlug } })
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  await prisma.subscriber.deleteMany({
    where: { projectId: project.id, email },
  })

  return NextResponse.json({ success: true })
}
