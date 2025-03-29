import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: { cid: string } }
) {
  try {
    const { cid } = params
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('cid', cid)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 