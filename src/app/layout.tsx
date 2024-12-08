'use client'
import { GeistSans } from 'geist/font/sans'
import ThemeProvider from '@/providers/ThemeProvider'
import NextTopLoader from 'nextjs-toploader'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import ReactQueryProvider from '@/providers/ReactQueryProvider'
import { Toaster } from '@/components/ui/toaster'
import Sidebar from '@/components/SideBar'
import { usePathname } from 'next/navigation'
import Snowfall from 'react-snowfall'
import { useState } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isSnowfallEnabled, setIsSnowfallEnabled] = useState(true)

  const handleSnowfallToggle = (enabled: boolean) => {
    setIsSnowfallEnabled(enabled)
  }

  return (
    <html lang="en" className={GeistSans.className}>
      <body className="text-foreground">
        {isSnowfallEnabled && <Snowfall snowflakeCount={50} />}

        <NextTopLoader showSpinner={false} height={2} color="#2acf80" />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <div className="duration-600 flex h-screen w-full overflow-hidden transition-all">
              {pathname !== '/login' && (
                <Sidebar
                  onSnowfallToggle={handleSnowfallToggle}
                  isSnowfallEnabled={isSnowfallEnabled}
                />
              )}
              <main
                className={`duration-600 flex-1 overflow-auto p-4 transition-all`}
              >
                {children}
              </main>
              <Toaster />
            </div>
            <Analytics />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
