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
import { useState, useEffect } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isSnowfallEnabled, setIsSnowfallEnabled] = useState(true)
  const isTestEnvironment =
    process.env.NEXT_PUBLIC_API_BASE_URL ===
    'https://tt-dev-staging.odoo.com/api'

  const handleSnowfallToggle = (enabled: boolean) => {
    setIsSnowfallEnabled(enabled)
  }

  const [snowflake2, setSnowflake2] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = document.createElement('img')
    img.src = '/pngwing.com.png'

    setSnowflake2(img)
  }, [])

  return (
    <html lang="en" className={GeistSans.className}>
      <body className="text-foreground">
        {isTestEnvironment && (
          <div className="w-full bg-orange-600 py-2 text-center font-medium text-white">
            Connected to Staging Instance :{' '}
            {process.env.NEXT_PUBLIC_API_BASE_URL}
          </div>
        )}
        {isSnowfallEnabled && snowflake2 && <Snowfall snowflakeCount={50} />}

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
