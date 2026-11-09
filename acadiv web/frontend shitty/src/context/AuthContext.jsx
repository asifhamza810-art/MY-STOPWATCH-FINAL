import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, clearTokens, getTokens, setTokens } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    const { access } = getTokens()
    if (!access) {
      setUser(null)
      setProfile(null)
      setLoading(false)
      return
    }
    try {
      const res = await api('/auth/me', { auth: true })
      setUser(res.data.user)
      setProfile(res.data.profile)
    } catch (err) {
      // Only wipe credentials if explicitly rejected as unauthorized (401), not transient network errors
      if (err.status === 401) {
        clearTokens()
        setUser(null)
        setProfile(null)
      } else {
        console.warn('Profile fetch warning (non-401):', err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  const login = async (email, password) => {
    const res = await api('/auth/login', { method: 'POST', body: { email, password } })
    setTokens(res.data)
    setUser(res.data.user)
    await refreshMe()
    return res.data
  }

  const register = async (payload) => {
    const res = await api('/auth/register', { method: 'POST', body: payload })
    setTokens(res.data)
    setUser(res.data.user)
    await refreshMe()
    return res.data
  }

  const logout = async () => {
    const { refresh } = getTokens()
    try {
      await api('/auth/logout', { method: 'POST', body: { refreshToken: refresh } })
    } catch {
      /* ignore */
    }
    clearTokens()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth requires AuthProvider')
  return ctx
}
