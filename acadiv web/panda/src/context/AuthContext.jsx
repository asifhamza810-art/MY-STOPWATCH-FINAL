import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, clearTokens, getTokens, setTokens } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [activeCareer, setActiveCareer] = useState(() => {
    try {
      const cached = localStorage.getItem('acadiv_active_career')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
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
      if (res.data.profile?.activeCareerId) {
        const c = res.data.profile.activeCareerId
        const activeObj = {
          id: c._id || c.id || res.data.profile.activeCareerId,
          slug: res.data.profile.activeCareerSlug || c.slug,
          title: res.data.profile.activeCareerTitle || c.title,
          domain: res.data.profile.activeCareerDomain || c.domain,
          compatibilityScore: res.data.profile.activeCareerCompatibility,
          selectedAt: res.data.profile.activeCareerSelectedAt,
        }
        setActiveCareer(activeObj)
        try {
          localStorage.setItem('acadiv_active_career', JSON.stringify(activeObj))
        } catch {
          /* ignore */
        }
      }
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

    const handleUnauthorized = () => {
      setUser(null)
      setProfile(null)
    }

    window.addEventListener('acadiv:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('acadiv:unauthorized', handleUnauthorized)
  }, [refreshMe])

  const selectActiveCareer = async (careerData) => {
    const careerId = careerData._id || careerData.id || careerData.careerId
    const compatibilityScore = careerData.compatibilityScore || 85

    try {
      const res = await api('/profile/active-career', {
        method: 'POST',
        auth: true,
        body: { careerId, compatibilityScore },
      })
      if (res.data?.activeCareer) {
        setActiveCareer(res.data.activeCareer)
        try {
          localStorage.setItem('acadiv_active_career', JSON.stringify(res.data.activeCareer))
        } catch {
          /* ignore */
        }
      }
      if (res.data?.profile) {
        setProfile(res.data.profile)
      }
      return res.data?.activeCareer
    } catch (err) {
      // Fallback local update if network is flaky
      console.warn('Network issue saving active career to DB, saving locally:', err.message)
      const fallback = {
        id: careerId,
        title: careerData.title,
        slug: careerData.slug,
        domain: careerData.domain || 'Professional',
        compatibilityScore,
        selectedAt: new Date().toISOString(),
      }
      setActiveCareer(fallback)
      try {
        localStorage.setItem('acadiv_active_career', JSON.stringify(fallback))
      } catch {
        /* ignore */
      }
      return fallback
    }
  }

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
    setActiveCareer(null)
    try {
      localStorage.removeItem('acadiv_active_career')
    } catch {
      /* ignore */
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        activeCareer,
        selectActiveCareer,
        loading,
        login,
        register,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth requires AuthProvider')
  return ctx
}
