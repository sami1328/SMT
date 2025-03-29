import { NextResponse } from 'next/server'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tid = searchParams.get('tid')
    const cid = searchParams.get('cid')
    const status = searchParams.get('status')

    const supabase = createClientComponentClient<Database>()
    let query = supabase.from('applications').select('*')

    if (tid) query = query.eq('tid', tid)
    if (cid) query = query.eq('cid', cid)
    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    
    const { tid, cid, status } = body

    // Check if trainee has already applied to this club
    const { data: existingApplication, error: checkError } = await supabase
      .from('applications')
      .select('*')
      .eq('tid', tid)
      .eq('cid', cid)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw checkError
    }

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this club' },
        { status: 400 }
      )
    }

    // Create new application
    const { data, error } = await supabase
      .from('applications')
      .insert([
        {
          tid,
          cid,
          status,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status, feedback } = await request.json()
    const supabase = createClientComponentClient<Database>()

    const { data, error } = await supabase
      .from('applications')
      .update({
        status,
        feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update application' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    const supabase = createClientComponentClient<Database>()

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Application deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete application' },
      { status: 500 }
    )
  }
} 