/**
 * GlobalLayout Component
 * This client component wraps all pages and conditionally renders the Header
 * on every route except '/login'. It also ensures proper layout structure
 * for pages protected by AuthWrapper.
 */
"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Header } from "./header"

interface GlobalLayoutProps {
  children: ReactNode
}

export function GlobalLayout({ children }: GlobalLayoutProps) {
  const pathname = usePathname()
  const showHeader = pathname !== "/login"

  return (
    <>
      {showHeader && <Header />}
      {children}
    </>
  )
}
