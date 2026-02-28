import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { listUserRepos } from '@/lib/github'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { githubAccessToken: true },
  })

  if (!user?.githubAccessToken) {
    return NextResponse.json(
      { error: 'GitHub token missing. Please sign out and sign back in.' },
      { status: 403 },
    )
  }

  const repos = await listUserRepos(user.githubAccessToken)

  // Exclude repos that are already connected
  const connectedIds = await prisma.project.findMany({
    where: { userId: session.user.id },
    select: { githubRepoId: true },
  })
  const connectedSet = new Set(connectedIds.map((p) => p.githubRepoId))

  const available = repos.map((r) => ({
    ...r,
    alreadyConnected: connectedSet.has(String(r.id)),
  }))

  return NextResponse.json(available)
}
