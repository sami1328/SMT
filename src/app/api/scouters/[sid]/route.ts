import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(
  request: Request,
  { params }: { params: { sid: string } }
) {
  try {
    const { sid } = params
    const supabase = createClientComponentClient<Database>()

    const { data, error } = await supabase
      .from('scouters')
      .select('*')
      .eq('sid', sid)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 