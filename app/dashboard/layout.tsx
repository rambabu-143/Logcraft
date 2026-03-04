import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/DashboardNav'
import { BackgroundOrbs } from '@/components/BackgroundOrbs'

export const metadata = { title: 'Dashboard' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/signin')

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#0c0c14] overflow-hidden">
      <BackgroundOrbs variant="subtle" />
      <DashboardNav user={session.user} />
      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
