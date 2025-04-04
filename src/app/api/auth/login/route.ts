import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    console.log('Login attempt for email:', email)
    
    // Create Supabase client with awaited cookies
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    }, {
      options: {
        global: {
          headers: {
            'x-my-custom-header': 'my-app-name',
          },
        },
      },
    })

    // Check scouters table first
    console.log('Checking scouter login...')
    try {
      const { data: scouterData, error: scouterError } = await supabase
        .from('scouters')
        .select('*')
        .eq('email', email)
        .single()

      if (scouterError) {
        console.log('Scouter query error:', scouterError)
        if (scouterError.code === 'PGRST116') {
          console.log('No scouter found with email:', email)
        } else {
          throw scouterError
        }
      }

      if (scouterData) {
        console.log('Found scouter record:', {
          sid: scouterData.sid,
          email: scouterData.email,
          name: scouterData.name
        })
        
        const isValidPassword = await bcrypt.compare(password, scouterData.password)
        console.log('Password verification result:', isValidPassword)
        
        if (isValidPassword) {
          console.log('Scouter login successful')
          return NextResponse.json({
            role: 'scouter',
            id: scouterData.sid,
            name: scouterData.name
          })
        } else {
          console.log('Scouter password verification failed')
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          )
        }
      }
    } catch (error) {
      console.error('Error during scouter check:', error)
    }

    // Check admins table
    console.log('Checking admin login...')
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single()

      if (adminError) {
        console.log('Admin query error:', adminError)
        if (adminError.code === 'PGRST116') {
          console.log('No admin found with email:', email)
        } else {
          throw adminError
        }
      }

      if (adminData) {
        console.log('Found admin record:', {
          aid: adminData.aid,
          email: adminData.email,
          name: adminData.name
        })
        
        const isValidPassword = await bcrypt.compare(password, adminData.password)
        console.log('Password verification result:', isValidPassword)
        
        if (isValidPassword) {
          console.log('Admin login successful')
          return NextResponse.json({
            role: 'admin',
            id: adminData.aid,
            name: adminData.name
          })
        } else {
          console.log('Admin password verification failed')
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          )
        }
      }
    } catch (error) {
      console.error('Error during admin check:', error)
    }

    // Check clubs table
    console.log('Checking club login...')
    try {
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('email', email)
        .single()

      if (clubError) {
        console.log('Club query error:', clubError)
        if (clubError.code === 'PGRST116') {
          console.log('No club found with email:', email)
        } else {
          throw clubError
        }
      }

      if (clubData) {
        console.log('Found club record:', {
          cid: clubData.cid,
          email: clubData.email,
          name: clubData.name
        })
        
        const isValidPassword = await bcrypt.compare(password, clubData.password)
        console.log('Password verification result:', isValidPassword)
        
        if (isValidPassword) {
          console.log('Club login successful')
          return NextResponse.json({
            role: 'club',
            id: clubData.cid,
            name: clubData.name
          })
        } else {
          console.log('Club password verification failed')
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          )
        }
      }
    } catch (error) {
      console.error('Error during club check:', error)
    }

    // Check trainees table using Supabase Auth
    console.log('Checking trainee login...')
    try {
      // Use Supabase Auth for trainee login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        console.log('Auth error:', authError)
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      if (authData.user) {
        // Get trainee details from trainees table using email
        const { data: traineeData, error: traineeError } = await supabase
          .from('trainees')
          .select('tid, name')
          .eq('email', email)
          .single()

        if (traineeError) {
          console.error('Error fetching trainee data:', traineeError)
          return NextResponse.json(
            { error: 'Failed to fetch trainee data' },
            { status: 500 }
          )
        }

        if (traineeData) {
          console.log('Trainee login successful')
          return NextResponse.json({
            role: 'trainee',
            id: traineeData.tid,
            name: traineeData.name
          })
        }
      }
    } catch (error) {
      console.error('Error during trainee check:', error)
    }

    // If we reach here, no valid user was found
    console.log('No valid user found, returning error')
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 