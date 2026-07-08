import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getMe, login as apiLogin, logout as apiLogout } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrater depuis le token stocké
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credentials) => {
    const { token, user } = await apiLogin(credentials)
    localStorage.setItem('token', token)
    setUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
