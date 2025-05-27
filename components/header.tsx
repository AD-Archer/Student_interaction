"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { LogOut, Settings, Plus, Building2, BarChart3, TrendingUp, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { LucideUser } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-wrapper"

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Dashboard"
        case "/settings":
          return "Settings"
          case "/analytics":
            return "Analytics"
            case "/create":
              return "New Interaction"
      default:
        return "Dashboard"
    }
  }

  const navigationItems = [
    { href: "/", label: "Dashboard", icon: BarChart3, active: pathname === "/" },
    { href: "/analytics", label: "Analytics", icon: TrendingUp, active: pathname === "/analytics" },
    { href: "/settings", label: "Settings", icon: Settings, active: pathname === "/settings" },
    { href: "/create", label: "New Interaction", icon: Plus, active: pathname === "/create" },
  ]

  const handleNavClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Mobile Header */}
        <div className="flex justify-between items-center py-3 md:py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-lg">
              <Building2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Launchpad</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Student Interaction Tracker</p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">

            {/* User Menu - Desktop */}
            {user && (
              <div className="hidden md:block">
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 px-3"
                  onClick={() => setIsMenuOpen(true)}
                >
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-1.5 rounded-full">
                    <LucideUser className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </div>
                </Button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Button variant="outline" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            
            {/* Shared Sidebar Sheet - Used by both mobile menu and desktop user profile */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Menu Header */}
                  <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="font-bold">Launchpad</h2>
                          <p className="text-sm text-blue-100">Student Interaction Tracker</p>
                        </div>
                      </div>
                    </div>
                    {user && (
                      <div className="mt-4 p-3 bg-white/10 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="bg-white/20 p-2 rounded-full">
                            <LucideUser className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-blue-100">{user.role}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex-1 p-6">
                    <nav className="space-y-2">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleNavClick}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                            item.active
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </nav>

                    {/* Quick Actions */}
                    {/* <div className="mt-8 space-y-3">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Quick Actions</h3>
                      <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700" onClick={() => { router.push("/create"); handleNavClick(); }}>
                        <Plus className="h-4 w-4 mr-3" />
                        New Interaction
                      </Button>
                    </div> */}
                  </div>
                  {/* Menu Footer */}
                  <div className="p-6 border-t bg-gray-50">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="border-t border-gray-100 hidden md:block">
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

        {/* Page Title - Mobile */}
        <div className="py-2 border-t border-gray-100 md:hidden">
          <h2 className="text-lg font-semibold text-gray-800">{getPageTitle()}</h2>
          <p className="text-sm text-gray-500">Student Interaction Management</p>
        </div>
      </div>
    </header>
  )
}
