import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getMe, login as apiLogin, logout as apiLogout } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) { setLoading(false); return }
    getMe()
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
      })
      .finally(() => setLoading(false))
  }, [])

  // remember=true → localStorage (persistant), remember=false → sessionStorage (onglet seulement)
  const login = useCallback(async (credentials, remember = true) => {
    const { token, user } = await apiLogin(credentials)
    if (remember) {
      localStorage.setItem('token', token)
      sessionStorage.removeItem('token')
    } else {
      sessionStorage.setItem('token', token)
      localStorage.removeItem('token')
    }
    setUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    try { await apiLogout() } finally {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
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
