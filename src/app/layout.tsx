'use client'
import { GeistSans } from 'geist/font/sans'
import ThemeProvider from '@/providers/ThemeProvider'
import NextTopLoader from 'nextjs-toploader'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ReactQueryProvider from '@/providers/ReactQueryProvider'
import { Toaster } from '@/components/ui/toaster'
import Sidebar from '@/components/SideBar'
import { usePathname } from 'next/navigation'
import Snowfall from 'react-snowfall'

// const defaultUrl = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : 'http://localhost:3000'

// export const metadata = {
//   metadataBase: new URL(defaultUrl),
//   title: 'Next.js and Supabase Starter Kit',
//   description: 'The fastest way to build apps with Next.js and Supabase',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="text-foreground">
        <Snowfall snowflakeCount={50} />
        <NextTopLoader showSpinner={false} height={2} color="#2acf80" />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <div className="duration-600 flex h-screen w-full overflow-hidden transition-all">
              {pathname !== '/login' && <Sidebar />}
              <main
                className={`duration-600 flex-1 overflow-auto p-4 transition-all`}
              >
                {children}
              </main>
              <Toaster />
            </div>
            <Analytics />{' '}
            {/* ^^ remove this if you are not deploying to vercel. See more at https://vercel.com/docs/analytics  */}
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
