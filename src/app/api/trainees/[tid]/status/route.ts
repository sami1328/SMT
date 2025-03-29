import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'
import { cookies } from 'next/headers'

export async function PATCH(
  request: Request,
  { params }: { params: { tid: string } }
) {
  try {
    const { status } = await request.json()
    const supabase = createRouteHandlerClient<Database>({ cookies })

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Ensure status is 'Test Completed' when updating after test submission
    const { data, error } = await supabase
      .from('trainees')
      .update({ status })
      .eq('tid', params.tid)

    if (error) throw error

    return NextResponse.json({ message: 'Status updated successfully' })
  } catch (error: any) {
    console.error('Error updating trainee status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update trainee status' },
      { status: 500 }
    )
  }
} 