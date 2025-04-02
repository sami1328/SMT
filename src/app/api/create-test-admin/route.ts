import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Create a test admin user
    const email = 'admin@test.com'
    const password = 'admin123'

    // First create the user in auth.users and auto-confirm email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // This automatically confirms the email
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 })
    }

    // Now create the admin record in the admins table
    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .insert({
        aid: authData.user.id, // Use the auth user id as the admin id
        name: 'Test Admin',
        email: email,
        password: hashedPassword,
        created_at: new Date().toISOString()
      })
      .select()

    if (adminError) {
      // If admin creation fails, clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      console.error('Error creating admin:', adminError)
      return NextResponse.json({ error: adminError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Test admin created successfully',
      email: email,
      password: password,
      auth_id: authData.user.id
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 