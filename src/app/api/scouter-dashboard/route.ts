import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Fetch Total Trainees Count
    const { count: totalTrainees } = await supabase
      .from('supabase11')
      .select('uid', { count: 'exact' })

    // Fetch Pending Test Count
    const { count: pendingTrainees } = await supabase
      .from('supabase11')
      .select('uid', { count: 'exact' })
      .eq('status', 'Pending Test')

    // Fetch Test Completed Count
    const { count: testedTrainees } = await supabase
      .from('supabase11')
      .select('uid', { count: 'exact' })
      .eq('status', 'Test Completed')

    return NextResponse.json({
      totalTrainees: totalTrainees || 0,
      pendingTrainees: pendingTrainees || 0,
      testedTrainees: testedTrainees || 0
    })
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
} 