"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { User } from "@/lib/data"

interface AuthWrapperProps {
  children: React.ReactNode
}

const AuthContext = createContext<{ user: User | null; isLoading: boolean } | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthWrapper")
  }
  return context
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem("currentUser")

    if (currentUser) {
      setUser(JSON.parse(currentUser))
    } else if (pathname !== "/login") {
      // Redirect to login if not authenticated and not already on login page
      router.push("/login")
    }

    setIsLoading(false)
  }, [pathname, router])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If on login page, always show it
  if (pathname === "/login") {
    return <>{children}</>
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!user) {
    return null
  }

  // If authenticated, render children
  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>
}
