import { createClient } from "@/lib/supabase/server"

export type UserRole = "admin" | "editor" | "viewer"

export interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user) {
    console.log('[Auth] getUserProfile: No user found')
    return null
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !profile) {
    console.log('[Auth] getUserProfile: Error or no profile', error)
    return null
  }

  return profile as UserProfile
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
