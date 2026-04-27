import { supabase } from '../supabaseClient'

const PROFILES_TABLE = 'profiles'

const normalizeRole = (role) => {
  if (!role) return null

  const value = String(role).toLowerCase()
  if (value === 'calciatore') return 'calciatore'
  if (value === 'societa' || value === 'società') return 'societa'
  return value
}

const mapProfile = (profile) => {
  if (!profile) return null
  return {
    ...profile,
    role: normalizeRole(profile.role || profile.tipo || profile.tipo_utente),
  }
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function register({ email, password, role, profile = {} }) {
  const userRole = normalizeRole(role)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: userRole },
    },
  })

  if (error) throw error

  const user = data.user
  if (user) {
    await upsertProfile({
      userId: user.id,
      profile: {
        ...profile,
        role: userRole,
      },
    })
  }

  return data
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getProfileByUserId(userId) {
  if (!userId) return null

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return mapProfile(data)
}

export async function upsertProfile({ userId, profile }) {
  if (!userId) throw new Error('userId is required')

  const payload = {
    ...profile,
    user_id: userId,
    role: normalizeRole(profile?.role || profile?.tipo || profile?.tipo_utente),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) throw error
  return mapProfile(data)
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
