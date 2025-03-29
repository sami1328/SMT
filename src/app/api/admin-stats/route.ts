import { NextResponse } from 'next/server'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

export async function GET() {
  try {
    const supabase = createClientComponentClient<Database>()

    // Get total counts
    const [
      { count: totalScouters },
      { count: totalClubs },
      { count: totalTrainees },
      { count: pendingTests },
      { count: completedTests },
      { count: totalApplications }
    ] = await Promise.all([
      supabase.from('scouters').select('*', { count: 'exact', head: true }),
      supabase.from('clubs').select('*', { count: 'exact', head: true }),
      supabase.from('trainees').select('*', { count: 'exact', head: true }),
      supabase.from('trainees').select('*', { count: 'exact', head: true }).eq('status', 'Pending Test'),
      supabase.from('test_results').select('*', { count: 'exact', head: true }),
      supabase.from('club_applications').select('*', { count: 'exact', head: true })
    ])

    return NextResponse.json({
      totalScouters,
      totalClubs,
      totalTrainees,
      pendingTests,
      completedTests,
      totalApplications
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
} 