import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteWebhook } from '@/lib/github'
import { z } from 'zod'

async function getOwnedProject(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
  })
}

// GET /api/projects/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      changelogs: { orderBy: { createdAt: 'desc' }, take: 20 },
      subscribers: { orderBy: { createdAt: 'desc' } },
      _count: { select: { changelogs: true, subscribers: true } },
    },
  })

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

const updateSchema = z.object({
  slackWebhookUrl: z.string().url().optional().or(z.literal('')),
  notifyEmail: z.string().email().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
})

// PATCH /api/projects/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const project = await getOwnedProject(params.id, session.user.id)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const updated = await prisma.project.update({
    where: { id: params.id },
    data: {
      slackWebhookUrl: parsed.data.slackWebhookUrl ?? undefined,
      notifyEmail: parsed.data.notifyEmail ?? undefined,
      isActive: parsed.data.isActive ?? undefined,
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/projects/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const project = await getOwnedProject(params.id, session.user.id)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Remove GitHub webhook
  if (project.webhookId) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { githubAccessToken: true },
    })
    if (user?.githubAccessToken) {
      deleteWebhook(project.repoFullName, Number(project.webhookId), user.githubAccessToken).catch(
        (e) => console.error('Failed to delete GitHub webhook:', e),
      )
    }
  }

  await prisma.project.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
