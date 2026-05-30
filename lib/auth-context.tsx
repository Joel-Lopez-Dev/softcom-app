"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Role = "admin" | "gerente_cartera" | "analyst"

export type User = {
  id: string
  nombre: string
  email: string
  role: Role
}

type AuthContextType = {
  user: User | null
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users para desarrollo local
const MOCK_USERS: Record<string, User> = {
  "admin@softcom.mx": {
    id: "1",
    nombre: "Carlos Admin",
    email: "admin@softcom.mx",
    role: "admin",
  },
  "gerente@softcom.mx": {
    id: "2",
    nombre: "Sofía Gerente",
    email: "gerente@softcom.mx",
    role: "gerente_cartera",
  },
  "analyst@softcom.mx": {
    id: "3",
    nombre: "Diego Analyst",
    email: "analyst@softcom.mx",
    role: "analyst",
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Función para cargar usuario desde localStorage
  const loadUser = () => {
    const stored = localStorage.getItem("softcom_user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }

  // Cargar usuario al montar y escuchar cambios
  useEffect(() => {
    loadUser()
    setIsLoading(false)
    
    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      loadUser()
    }
    
    window.addEventListener("storage", handleStorageChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const logout = () => {
    setUser(null)
    localStorage.removeItem("softcom_user")
  }

  return (
    <AuthContext.Provider value={{ user, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}

// Helper para login (usado desde login page)
export function getMockUser(email: string) {
  return MOCK_USERS[email] || null
}
