import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Create a test club user
    const password = 'club123'
    const hashedPassword = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from('clubs')
      .insert({
        cid: crypto.randomUUID(),
        name: 'Test Club',
        email: 'club@test.com',
        password: hashedPassword
      })
      .select()

    if (error) {
      console.error('Error creating club:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Test club created successfully',
      email: 'club@test.com',
      password: 'club123'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 