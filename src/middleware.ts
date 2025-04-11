import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/utils/supabase'

// Configure your allowed IPs and networks
// const ALLOWED_IPS = (process.env.ALLOWED_IPS || '127.0.0.1')
//   .split(',')
//   .map((ip) => ip.trim())

// console.log(ALLOWED_IPS)

// Configure paths that should bypass IP restriction
const PUBLIC_PATHS = [
  '/login', // Public login page
  '/noaccess',
]

// Helper function to check if an IP is in a CIDR range
function ipInCIDR(ip: string, cidr: string): boolean {
  const [range, bits = '32'] = cidr.split('/')
  const mask = ~((1 << (32 - parseInt(bits))) - 1)
  const ipParts = ip.split('.').map((part) => parseInt(part))
  const rangeParts = range.split('.').map((part) => parseInt(part))
  const ipNum =
    (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3]
  const rangeNum =
    (rangeParts[0] << 24) +
    (rangeParts[1] << 16) +
    (rangeParts[2] << 8) +
    rangeParts[3]
  return (ipNum & mask) === (rangeNum & mask)
}

// Helper function to check if a path should bypass IP restriction
function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath))
}

// Helper function to get client IP from various headers
// function getClientIP(request: NextRequest): string {
//   // Check forwarded headers first (common with proxies/load balancers)
//   const forwarded = request.headers.get('x-forwarded-for')
//   if (forwarded) {
//     return forwarded.split(',')[0].trim()
//   }

//   // Fall back to direct IP
//   const ip = request.ip
//   if (ip) {
//     return ip
//   }

//   // Last resort: remote address
//   return request.headers.get('remote-addr') || '0.0.0.0'
// }

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)
  const path = request.nextUrl.pathname
  // Allow access to public paths
  if (isPublicPath(path)) {
    return NextResponse.next()
  }

  // const clientIP = getClientIP(request)

  // Check if client IP is allowed
  // const isAllowed = ALLOWED_IPS.some((allowedIP) => {
  //   if (allowedIP.includes('/')) {
  //     return ipInCIDR(clientIP, allowedIP)
  //   }
  //   return clientIP === allowedIP
  // })

  // if (!isAllowed) {
  //   // Optional: Log unauthorized access attempts
  //   console.warn(
  //     `Unauthorized access attempt from IP: ${clientIP} to path: ${path}`,
  //   )
  //   // Redirect to /noaccess
  //   const noAccessUrl = new URL('/noaccess', request.url)
  //   return NextResponse.redirect(noAccessUrl)
  // }

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
    // Match all paths except static files and public paths
    '/((?!_next/static|favicon.ico|public).*)',
  ],
}
