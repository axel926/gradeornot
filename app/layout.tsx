import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#F5B731',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'GradeOrNot — TCG Grading ROI',
  description: 'Scan your TCG card. Know if grading is worth it. Real ROI, real data.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GradeOrNot',
  },
  openGraph: {
    title: 'GradeOrNot — Should you grade it?',
    description: 'Real grading ROI for TCG investors. Scan. Analyze. Decide.',
    url: 'https://gradeornot.vercel.app',
    siteName: 'GradeOrNot',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GradeOrNot',
    description: 'Real grading ROI for TCG investors.',
  },
  keywords: ['TCG', 'PSA', 'grading', 'Pokemon', 'ROI', 'card grading', 'BGS', 'CGC'],
}

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import BottomNav from './components/BottomNav'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let isLoggedIn = false
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    isLoggedIn = !!session
  } catch {}

  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body style={{ overscrollBehavior: 'none' }}>
        {children}
        <BottomNav isLoggedIn={isLoggedIn} />
      </body>
    </html>
  )
}
