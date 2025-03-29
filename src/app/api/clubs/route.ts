import { NextResponse } from 'next/server'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const club = await request.json()
    const supabase = createClientComponentClient<Database>()

    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'location', 'phone', 'contact_person']
    for (const field of requiredFields) {
      if (!club[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Create club
    const { data, error } = await supabase
      .from('clubs')
      .insert([{
        ...club,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create club' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { cid, ...updates } = await request.json()
    const supabase = createClientComponentClient<Database>()

    const { data, error } = await supabase
      .from('clubs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('cid', cid)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update club' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { cid } = await request.json()
    const supabase = createClientComponentClient<Database>()

    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('cid', cid)

    if (error) throw error

    return NextResponse.json({ message: 'Club deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete club' },
      { status: 500 }
    )
  }
} 