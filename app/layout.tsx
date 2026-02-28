import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'Changelogfy — AI-powered changelogs from your git commits',
    template: '%s | Changelogfy',
  },
  description:
    'Automatically generate beautiful, AI-powered changelogs from your GitHub commits. Connect your repo, push to main, done.',
  openGraph: {
    type: 'website',
    siteName: 'Changelogfy',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
