import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PublicChangelogPage } from '@/components/PublicChangelogPage'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { publicSlug: params.slug, isActive: true },
  })
  if (!project) return { title: 'Not found' }

  const name = project.repoFullName.split('/')[1]
  return {
    title: `${name} — Changelog`,
    description: `See what's new in ${name}. AI-powered changelog generated from git commits.`,
  }
}

export default async function PublicSlugPage({ params }: Props) {
  const project = await prisma.project.findUnique({
    where: { publicSlug: params.slug, isActive: true },
    include: {
      changelogs: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
      },
      user: { select: { plan: true } },
    },
  })

  if (!project) notFound()

  return (
    <PublicChangelogPage
      project={{
        id: project.id,
        repoFullName: project.repoFullName,
        publicSlug: project.publicSlug,
        plan: project.user.plan,
      }}
      changelogs={project.changelogs.map((c) => ({
        id: c.id,
        version: c.version,
        generatedContent: c.generatedContent,
        publishedAt: c.publishedAt?.toISOString() ?? c.createdAt.toISOString(),
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  )
}
