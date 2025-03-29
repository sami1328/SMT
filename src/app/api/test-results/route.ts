import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'
import { cookies } from 'next/headers'

// GET endpoint to retrieve test results for a specific trainee
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tid = searchParams.get('tid')

    if (!tid) {
      return NextResponse.json(
        { error: 'Trainee ID is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('tid', tid)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch test results' },
      { status: 500 }
    )
  }
}

// POST endpoint to submit test results
export async function POST(request: Request) {
  try {
    const testResult = await request.json()
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Validate required fields
    const requiredFields = ['tid', 'speed', 'agility', 'strength', 'endurance']
    for (const field of requiredFields) {
      if (!testResult[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate numeric fields are between 1 and 10
    const numericFields = ['speed', 'agility', 'strength', 'endurance']
    for (const field of numericFields) {
      const value = Number(testResult[field])
      if (isNaN(value) || value < 1 || value > 10) {
        return NextResponse.json(
          { error: `${field} must be a number between 1 and 10` },
          { status: 400 }
        )
      }
    }

    // Insert test result
    const { data: resultData, error: resultError } = await supabase
      .from('test_results')
      .insert([testResult])
      .select()

    if (resultError) throw resultError

    // Update trainee status
    const { error: updateError } = await supabase
      .from('trainees')
      .update({ status: 'Test Completed' })
      .eq('tid', testResult.tid)

    if (updateError) throw updateError

    return NextResponse.json(resultData[0])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit test results' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { tid, ...updates } = await request.json()
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { data, error } = await supabase
      .from('test_results')
      .update(updates)
      .eq('tid', tid)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update test results' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Result ID is required' }, { status: 400 })
    }
    
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { error } = await supabase
      .from('test_results')
      .delete()
      .eq('tid', id)

    if (error) throw error

    return NextResponse.json({ message: 'Test results deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete test results' },
      { status: 500 }
    )
  }
} 