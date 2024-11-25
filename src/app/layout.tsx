'use client'
import { GeistSans } from 'geist/font/sans'
import ThemeProvider from '@/providers/ThemeProvider'
import NextTopLoader from 'nextjs-toploader'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ReactQueryProvider from '@/providers/ReactQueryProvider'
import { Toaster } from "@/components/ui/toaster"
import Sidebar from "@/components/SideBar";
import { usePathname } from 'next/navigation'

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
}
) 
{
  const pathname = usePathname()
  return (
    <html
      lang="en"
      className={GeistSans.className}
    >
      <body className="text-foreground">
        <NextTopLoader showSpinner={false} height={2} color="#2acf80" />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
          <div className="flex h-screen transition-all duration-600">
          {pathname !== '/login' && <Sidebar />}
        <main className={`flex-1 p-4 transition-all duration-600 ml-4`}>
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
