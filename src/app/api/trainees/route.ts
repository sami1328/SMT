import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'
import { cookies } from 'next/headers'

// GET endpoint to list trainees
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 10
    const offset = (page - 1) * limit

    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get total count
    const { count } = await supabase
      .from('trainees')
      .select('*', { count: 'exact', head: true })

    // Get paginated trainees
    const { data: trainees, error } = await supabase
      .from('trainees')
      .select('*')
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      trainees,
      totalCount: count,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trainees' },
      { status: 500 }
    )
  }
}

// POST endpoint to register new trainee
export async function POST(request: Request) {
  try {
    const trainee = await request.json()
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { data, error } = await supabase
      .from('trainees')
      .insert([trainee])
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create trainee' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { tid, ...updates } = await request.json()
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { data, error } = await supabase
      .from('trainees')
      .update(updates)
      .eq('tid', tid)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update trainee' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tid = searchParams.get('tid')

    if (!tid) {
      return NextResponse.json({ error: 'Trainee ID is required' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { error } = await supabase
      .from('trainees')
      .delete()
      .eq('tid', tid)

    if (error) throw error

    return NextResponse.json({ message: 'Trainee deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete trainee' },
      { status: 500 }
    )
  }
} 