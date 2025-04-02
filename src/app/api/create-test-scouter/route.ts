import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Create a test scouter user
    const password = 'scouter123'
    const hashedPassword = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from('scouters')
      .insert({
        sid: crypto.randomUUID(),
        name: 'Test Scouter',
        email: 'scouter@test.com',
        password: hashedPassword
      })
      .select()

    if (error) {
      console.error('Error creating scouter:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Test scouter created successfully',
      email: 'scouter@test.com',
      password: 'scouter123'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 