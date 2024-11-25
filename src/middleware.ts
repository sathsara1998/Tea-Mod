import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/utils/supabase'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  // Get the session (if available)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = request.nextUrl

  // Allow requests to the login page without a session
  if (url.pathname.startsWith('/login')) {
    return response
  }

  // If there's no session, redirect to the login page
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If the user is authenticated, allow the request to continue
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
