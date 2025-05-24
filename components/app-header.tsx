"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, ChevronDown, Bell, Plus, Building2, BarChart3, TrendingUp } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { LucideUser } from "lucide-react"
import Link from "next/link"

interface User {
  email: string
  name: string
  role: string
}

export function AppHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      setUser(JSON.parse(currentUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Dashboard"
      case "/create":
        return "New Interaction"
      case "/settings":
        return "Settings"
      case "/analytics":
        return "Analytics"
      default:
        return "Dashboard"
    }
  }

  const navigationItems = [
    { href: "/", label: "Dashboard", icon: BarChart3, active: pathname === "/" },
    { href: "/analytics", label: "Analytics", icon: TrendingUp, active: pathname === "/analytics" },
    { href: "/create", label: "New Interaction", icon: Plus, active: pathname === "/create" },
    { href: "/settings", label: "Settings", icon: Settings, active: pathname === "/settings" },
  ]

  const getQuickStats = () => {
    switch (pathname) {
      case "/analytics":
        return [
          { label: "This Week", value: "12" },
          { label: "Success Rate", value: "94%" },
        ]
      case "/settings":
        return [
          { label: "Active Users", value: "3" },
          { label: "System Health", value: "100%" },
        ]
      default:
        return [
          { label: "Today", value: "6" },
          { label: "Overdue", value: "2" },
        ]
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Launchpad</h1>
                <p className="text-xs text-gray-500">Building 21 Workforce Development</p>
              </div>
            </div>
            <div className="hidden md:block h-8 w-px bg-gray-300" />
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-gray-800">{getPageTitle()}</h2>
              <p className="text-sm text-gray-500">Student Interaction Management</p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-4">
              {getQuickStats().map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-lg font-bold text-blue-600">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Notifications */}
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 px-3">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-1.5 rounded-full">
                      <LucideUser className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.role}</div>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <LucideUser className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="border-t border-gray-100">
          <nav className="flex space-x-8 py-3">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
