import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup' || path === '/' || path === '/team' || path === '/contact'

  // For protected routes, we'll handle authentication on the client side
  if (!isPublicPath) {
    return NextResponse.next()
  }

  // Get the user data from cookie
  const userCookie = request.cookies.get('user')
  const user = userCookie ? JSON.parse(decodeURIComponent(userCookie.value)) : null

  // If trying to access public paths while logged in, redirect to appropriate dashboard
  if (isPublicPath && user) {
    let redirectPath = '/dashboard'
    
    switch (user.role) {
      case 'admin':
        redirectPath = '/dashboard/admin'
        break
      case 'scouter':
        redirectPath = `/dashboard/scouter/${user.id}`
        break
      case 'club':
        redirectPath = `/dashboard/club/${user.id}`
        break
      case 'trainee':
        redirectPath = `/dashboard/trainee/${user.id}`
        break
    }
    
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  // If trying to access protected routes while logged out, redirect to login
  if (!isPublicPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/team',
    '/contact',
  ]
} 