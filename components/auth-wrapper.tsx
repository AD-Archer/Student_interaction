/**
 * auth-wrapper.tsx
 * This client component handles authentication and route protection for the application.
 * It checks if the user is logged in and redirects to login page when trying to access 
 * protected routes while unauthenticated. It also creates and maintains an authentication
 * context that child components can use to access user data.
 */

"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
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
  
  // Define public routes that don't require authentication; memoize to keep reference stable
  const publicRoutes = React.useMemo(() => ["/info", "/login"], [])

  useEffect(() => {
    try {
      // Check if user is logged in using client-side storage
      if (typeof window !== 'undefined') {
        const currentUser = localStorage.getItem("currentUser")
        
        // Ensure pathname is always a string before using it
        const safePathname = pathname || "";

        if (currentUser) {
          setUser(JSON.parse(currentUser))
        } else if (!publicRoutes.includes(safePathname)) {
          // Redirect to login if not authenticated and not on a public route
          router.push("/login")
        }
      }
    } catch (error) {
      console.error("Error in auth check:", error)
    } finally {
      setIsLoading(false)
    }
  // Adding publicRoutes to dependency array to fix React Hook warning
  }, [pathname, router, publicRoutes])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Create the auth context value that will be passed to children
  const authContextValue = { user, isLoading }
  
  // For public routes or logged in users, render the children within the context
  const safePathname = pathname || "";
  if (publicRoutes.includes(safePathname) || user) {
    console.log("AuthWrapper: Rendering children for", safePathname);
    return (
      <AuthContext.Provider value={authContextValue}>
        {children}
      </AuthContext.Provider>
    )
  }
  
  return null
}
