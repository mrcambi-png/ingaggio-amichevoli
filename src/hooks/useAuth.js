import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getCurrentSession,
  getCurrentUser,
  getProfileByUserId,
  login,
  logout,
  onAuthStateChange,
  register,
  upsertProfile,
} from '../services/authService'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAuthState = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const currentSession = await getCurrentSession()
      setSession(currentSession)

      const currentUser = currentSession?.user || (await getCurrentUser())
      setUser(currentUser || null)

      if (currentUser?.id) {
        const currentProfile = await getProfileByUserId(currentUser.id)
        setProfile(currentProfile)
      } else {
        setProfile(null)
      }
    } catch (authError) {
      setError(authError)
      setSession(null)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = useCallback(
    async (credentials) => {
      setError(null)
      await login(credentials)
      await loadAuthState()
    },
    [loadAuthState],
  )

  const signUp = useCallback(
    async (payload) => {
      setError(null)
      await register(payload)
      await loadAuthState()
    },
    [loadAuthState],
  )

  const signOut = useCallback(async () => {
    setError(null)
    await logout()
    setSession(null)
    setUser(null)
    setProfile(null)
  }, [])

  const saveProfile = useCallback(
    async (profilePatch) => {
      if (!user?.id) return null
      const updated = await upsertProfile({ userId: user.id, profile: profilePatch })
      setProfile(updated)
      return updated
    },
    [user?.id],
  )

  useEffect(() => {
    loadAuthState()

    const {
      data: { subscription },
    } = onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession)
      const currentUser = currentSession?.user || null
      setUser(currentUser)

      if (currentUser?.id) {
        const currentProfile = await getProfileByUserId(currentUser.id)
        setProfile(currentProfile)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [loadAuthState])

  return useMemo(
    () => ({
      session,
      user,
      profile,
      role: profile?.role || null,
      isAuthenticated: Boolean(user),
      loading,
      error,
      signIn,
      signUp,
      signOut,
      refreshAuth: loadAuthState,
      saveProfile,
    }),
    [session, user, profile, loading, error, signIn, signUp, signOut, loadAuthState, saveProfile],
  )
}
