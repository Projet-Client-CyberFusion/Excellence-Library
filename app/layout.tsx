import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { SessionKeeper } from '@/components/auth/session-keeper'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif' })

export const metadata: Metadata = {
  title: {
    default: 'Excellence Library',
    template: '%s · Excellence Library',
  },
  description: 'Your digital space for reading and learning.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/logo.jpeg', type: 'image/jpeg' }],
    apple: '/logo.jpeg',
  },
  other: { google: 'notranslate' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#142b4a',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" translate="no" suppressHydrationWarning className={`notranslate light ${inter.variable} ${sourceSerif.variable}`}>
      <body translate="no" className="notranslate min-h-dvh antialiased">
        <SessionKeeper />
        {children}
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
