import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user')
    if (!storedUser && !isAuthPage) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (storedUser && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } else {
    // Server-side check
    if (!token && !isAuthPage) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (token && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*']
} 