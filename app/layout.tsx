import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'Logcraft — AI-powered changelogs from your git commits',
    template: '%s | Logcraft',
  },
  description:
    'Automatically generate beautiful, AI-powered changelogs from your GitHub commits. Connect your repo, push to main, done.',
  openGraph: {
    type: 'website',
    siteName: 'Logcraft',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch(e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
