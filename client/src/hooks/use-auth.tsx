import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChange, type AuthUser } from '@/lib/supabase'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
})

// Custom event for local auth state changes
export const authEvent = new EventTarget();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Handle Supabase auth state changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      if (user) {
        setUser({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name,
          role: user.user_metadata?.role
        })
      } else if (!user && !localStorage.getItem('localAuthUser')) {
        // Only clear user if there's no local auth user
        setUser(null)
      }
      setLoading(false)
    })

    // Handle local auth state changes
    const handleLocalAuth = (event: any) => {
      const userData = event.detail;
      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role
        })
        localStorage.setItem('localAuthUser', JSON.stringify(userData))
      } else {
        setUser(null)
        localStorage.removeItem('localAuthUser')
      }
      setLoading(false)
    }

    // Check for existing local auth user on mount
    const localUser = localStorage.getItem('localAuthUser')
    if (localUser) {
      try {
        const userData = JSON.parse(localUser)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing local auth user:', error)
        localStorage.removeItem('localAuthUser')
      }
    }
    
    setLoading(false)

    authEvent.addEventListener('authChange', handleLocalAuth)

    return () => {
      subscription.unsubscribe()
      authEvent.removeEventListener('authChange', handleLocalAuth)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}