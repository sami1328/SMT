import { NextResponse } from 'next/server'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sid = searchParams.get('sid')

    const supabase = createClientComponentClient<Database>()
    let query = supabase.from('scouters').select('*')

    if (sid) {
      query = query.eq('sid', sid).single()
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch scouters' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const scouter = await request.json()
    const supabase = createClientComponentClient<Database>()

    // Validate required fields
    const requiredFields = ['name', 'email', 'password']
    for (const field of requiredFields) {
      if (!scouter[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Create scouter
    const { data, error } = await supabase
      .from('scouters')
      .insert([{
        ...scouter,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create scouter' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { sid, ...updates } = await request.json()
    const supabase = createClientComponentClient<Database>()

    const { data, error } = await supabase
      .from('scouters')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('sid', sid)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update scouter' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { sid } = await request.json()
    const supabase = createClientComponentClient<Database>()

    const { error } = await supabase
      .from('scouters')
      .delete()
      .eq('sid', sid)

    if (error) throw error

    return NextResponse.json({ message: 'Scouter deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete scouter' },
      { status: 500 }
    )
  }
} 