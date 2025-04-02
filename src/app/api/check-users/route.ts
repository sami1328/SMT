import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check all tables
    const [trainees, admins, scouters, clubs] = await Promise.all([
      supabase.from('trainees').select('email'),
      supabase.from('admins').select('email'),
      supabase.from('scouters').select('email'),
      supabase.from('clubs').select('email')
    ])

    return NextResponse.json({
      trainees: trainees.data || [],
      admins: admins.data || [],
      scouters: scouters.data || [],
      clubs: clubs.data || []
    })
  } catch (error) {
    console.error('Error checking users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 