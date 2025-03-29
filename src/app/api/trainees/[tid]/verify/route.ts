import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: { tid: string } }
) {
  try {
    const { tid } = params
    console.log('Verifying trainee ID:', tid)
    
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data, error } = await supabase
      .from('trainees')
      .select('*')
      .eq('tid', tid)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Verification result:', { exists: !!data })
    return NextResponse.json({ exists: !!data })
  } catch (error: any) {
    console.error('Detailed verification error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    return NextResponse.json(
      { error: error.message || 'Failed to verify trainee' },
      { status: 500 }
    )
  }
} 