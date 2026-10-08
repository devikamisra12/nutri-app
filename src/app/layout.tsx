import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Nutrition Assistant',
  description: 'Evidence-based clinical & sports nutrition reasoning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0B0F17] text-slate-100 font-sans antialiased min-h-screen flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  )
}
