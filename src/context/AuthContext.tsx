// AI-assisted: React Context pattern aided by Claude (Anthropic)
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// This defines the shape of the user object we store after login
interface User {
  userId: number
  name: string
  role: string
}

// This defines everything our context will provide to the rest of the app
interface AuthContextType {
  user: User | null        // null means not logged in
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean       // true while we're checking localStorage on first load
}

// Create the context with a default value of null
const AuthContext = createContext<AuthContextType | null>(null)

// This is the Provider — it wraps the whole app and makes auth data available everywhere
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [token, setToken]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On first load, check if a token is already saved in localStorage
  // This keeps the user logged in after a page refresh
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser  = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }

    setIsLoading(false)
  }, [])

  // Called after a successful login — saves to state and localStorage
  const login = (token: string, user: User) => {
    setToken(token)
    setUser(user)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  // Called on logout — clears everything
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — any component can call useAuth() to access the context
// Instead of writing useContext(AuthContext) every time
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}