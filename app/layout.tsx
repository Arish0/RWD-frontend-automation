import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RealWorld E2E | Test Dashboard',
  description: 'End-to-end test automation dashboard for RealWorld NFT lending platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
