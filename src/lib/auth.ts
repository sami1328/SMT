import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface User {
  id: string
  email: string
  full_name: string
  role: string
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) throw error
    if (!session?.user) return null

    // Get user profile data from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError) throw profileError
    if (!profile) return null

    return {
      id: session.user.id,
      email: session.user.email || '',
      full_name: profile.full_name || '',
      role: profile.role || 'user'
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function signOut(): Promise<void> {
  const supabase = createClientComponentClient()
  
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
} 