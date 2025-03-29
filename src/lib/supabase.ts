import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabase = createClientComponentClient()

export type UserRole = 'trainee' | 'scouter' | 'club'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name: string
}

interface SignUpParams {
  email: string
  password: string
  role: 'trainee' | 'scouter' | 'club'
  full_name: string
}

export async function signUp({ email, password, role, full_name }: SignUpParams) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name,
      },
    },
  })

  return { data, error }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign in error:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Sign in catch error:', error)
    return { data: null, error }
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }

  if (!user) {
    return null
  }

  return {
    email: user.email || '',
    full_name: user.user_metadata?.full_name || '',
    role: user.user_metadata?.role || ''
  }
} 