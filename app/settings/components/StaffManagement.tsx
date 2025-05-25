/**
 * StaffManagement.tsx
 * Renders the staff management list and add staff form for the settings page.
 * Expects staffMembers, getPermissionColor, and all button handlers as props.
 * This is only used on the /settings page and is not global.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Lock, Plus } from "lucide-react"
import React from "react"

export const StaffManagement = ({ staffMembers, getPermissionColor }: {
  staffMembers: Array<{
    id: number
    name: string
    email: string
    role: string
    status: string
    lastLogin: string
    permissions: string[]
  }>,
  getPermissionColor: (permission: string) => string
}) => (
  <div className="w-full">
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div>
            <CardTitle className="text-lg sm:text-xl">Staff Management</CardTitle>
            <CardDescription>Manage team members and their access permissions</CardDescription>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New Staff
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {staffMembers.map((staff) => (
            <div
              key={staff.id}
              className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-6 border rounded-xl bg-gray-50 space-y-4 lg:space-y-0 transition-all hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 sm:p-3 rounded-full">
                  {/* I use a generic user icon for all staff */}
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{staff.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{staff.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{staff.role}</Badge>
                    <Badge variant="outline" className="text-green-700 border-green-200 text-xs">{staff.status}</Badge>
                    <span className="text-xs text-gray-500 hidden sm:inline">Last login: {staff.lastLogin}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex flex-wrap gap-1">
                  {staff.permissions.map((permission) => (
                    <Badge key={permission} className={`${getPermissionColor(permission)} text-xs`}>
                      {permission}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none text-red-600 hover:text-red-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    {/* Add New Staff Form (static, not wired up) */}
    <Card className="shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Add New Staff Member</CardTitle>
        <CardDescription>Create a new account for a team member</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="staffName">Full Name</Label>
              <Input id="staffName" placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffEmail">Email Address</Label>
              <Input id="staffEmail" type="email" placeholder="Enter email address" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="staffRole">Role/Title</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="counselor">Senior Counselor</SelectItem>
                  <SelectItem value="coordinator">Workforce Coordinator</SelectItem>
                  <SelectItem value="manager">Program Manager</SelectItem>
                  <SelectItem value="admin">System Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="permissions">Permissions</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select permission level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read Only</SelectItem>
                  <SelectItem value="write">Read & Write</SelectItem>
                  <SelectItem value="admin">Full Admin Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Staff Account
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
)
