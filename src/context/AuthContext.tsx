import React, { createContext, useContext, useEffect, useState } from 'react'
import auth from '../lib/auth'

type AuthContextType = {
  user: any | null
  loginWithToken: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    const token = auth.getToken()
    if (token) setUser(auth.decodeToken(token))
  }, [])

  function loginWithToken(token: string) {
    auth.setToken(token)
    setUser(auth.decodeToken(token))
  }

  function logout() {
    auth.clearToken()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loginWithToken, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
