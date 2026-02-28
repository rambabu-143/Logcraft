import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/changelogs/[id] — delete a changelog
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const changelog = await prisma.changelog.findUnique({
    where: { id: params.id },
    include: { project: { select: { userId: true } } },
  })

  if (!changelog) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (changelog.project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.changelog.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}

// PATCH /api/changelogs/[id] — toggle publish state
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const changelog = await prisma.changelog.findUnique({
    where: { id: params.id },
    include: { project: { select: { userId: true } } },
  })

  if (!changelog) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (changelog.project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const updated = await prisma.changelog.update({
    where: { id: params.id },
    data: {
      isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : changelog.isPublished,
      publishedAt: body.isPublished === true ? (changelog.publishedAt ?? new Date()) : changelog.publishedAt,
    },
  })

  return NextResponse.json(updated)
}
