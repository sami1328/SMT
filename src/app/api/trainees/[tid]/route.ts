import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { tid: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Fetch trainee data
    const { data: trainee, error: traineeError } = await supabase
      .from('trainees')
      .select('*')
      .eq('tid', params.tid)
      .single()

    if (traineeError) {
      console.error('Error fetching trainee:', traineeError)
      return NextResponse.json(
        { error: 'Failed to fetch trainee data' },
        { status: 500 }
      )
    }

    // Fetch test results to determine status
    const { data: testResults, error: testError } = await supabase
      .from('test_results')
      .select('*')
      .eq('tid', params.tid)

    if (testError) {
      console.error('Error fetching test results:', testError)
      return NextResponse.json(
        { error: 'Failed to fetch test results' },
        { status: 500 }
      )
    }

    // Determine status based on test results
    let status = trainee.status
    if (testResults && testResults.length > 0) {
      const hasPassedTest = testResults.some(result => {
        // Calculate average score from all attributes
        const attributes = Object.entries(result)
          .filter(([key]) => 
            key !== 'id' && 
            key !== 'tid' && 
            key !== 'submitted_by' && 
            key !== 'created_at'
          )
          .map(([_, value]) => value as number)
        
        const averageScore = attributes.reduce((sum, score) => sum + score, 0) / attributes.length
        return averageScore >= 60 // Consider test passed if average score is 60 or higher
      })

      if (hasPassedTest && status !== 'Test Completed') {
        status = 'Test Completed'
      }
    }

    // Update trainee status if it has changed
    if (status !== trainee.status) {
      const { error: updateError } = await supabase
        .from('trainees')
        .update({ status })
        .eq('tid', params.tid)

      if (updateError) {
        console.error('Error updating trainee status:', updateError)
        return NextResponse.json(
          { error: 'Failed to update trainee status' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ ...trainee, status })
  } catch (error) {
    console.error('Error in GET /api/trainees/[tid]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { tid: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status value
    const validStatuses = ['Pending Test', 'Test Completed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('trainees')
      .update({ status })
      .eq('tid', params.tid)
      .select()
      .single()

    if (error) {
      console.error('Error updating trainee:', error)
      return NextResponse.json(
        { error: 'Failed to update trainee' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PATCH /api/trainees/[tid]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 