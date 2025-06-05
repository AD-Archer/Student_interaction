/**
 * StaffManagement.tsx
 * Full-featured staff management component with CRUD operations.
 * Connects to the /api/staff endpoints for real database operations.
 * Includes admin permission checking and self-protection features.
 * This is only used on the /settings page and is not global.
 */

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, RotateCcw, Shield, X, User, Users, Mail, Briefcase, Settings } from "lucide-react"
import React, { useState, useEffect } from "react"
import { StaffMember, User as UserType } from "@/lib/data"
import { staffAPI, userAPI } from "@/lib/api"

export default function StaffManagement() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    isAdmin: false,
    permissions: ['read', 'write'] as string[]
  })

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  // I fetch current user info to check admin status
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await userAPI.getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error('Failed to fetch current user:', error)
      }
    }
    fetchCurrentUser()
  }, [])

  // I load staff members when component mounts
  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const data = await staffAPI.getAll()
      setStaffMembers(data)
    } catch (error) {
      console.error('Failed to fetch staff:', error)
      setError('Failed to load staff members')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      isAdmin: false,
      permissions: ['read', 'write']
    })
    setEditingStaff(null)
    setShowForm(false)
    clearMessages()
  }

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  const handleEdit = (staff: StaffMember) => {
    setFormData({
      firstName: staff.firstName || "",
      lastName: staff.lastName || "",
      email: staff.email,
      role: staff.role || "",
      isAdmin: staff.isAdmin,
      permissions: staff.permissions
    })
    setEditingStaff(staff)
    setShowForm(true)
    clearMessages()
  }

  const handlePasswordReset = async (staff: StaffMember) => {
    // Only admins can reset other staff passwords
    if (!currentUser?.permissions?.includes('admin')) {
      setError('Only admins can reset other staff passwords.')
      // I scroll to the top of the page so the error is visible
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }
    if (!window.confirm(`Reset password for ${staff.name}? The new password will be "@Changeme2"`)) {
      return
    }
    try {
      await staffAPI.update(staff.id, { ...staff, password: "@Changeme2" })
      alert(`Password reset for ${staff.name}. New password: @Changeme2`)
      setSuccess(`Password reset for ${staff.name}`)
    } catch (error) {
      console.error('Failed to reset password:', error)
      setError('Failed to reset password')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError("First name, last name, and email are required")
      return
    }

    try {
      if (editingStaff) {
        // I prevent users from removing their own admin privileges
        if (currentUser && editingStaff && currentUser.email === editingStaff.email && editingStaff.isAdmin && !formData.isAdmin) {
          setError("You cannot remove your own admin privileges")
          return
        }

        const updatedStaff = await staffAPI.update(editingStaff.id, {
          ...editingStaff,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          isAdmin: formData.isAdmin,
          permissions: formData.permissions
        })
        setStaffMembers(prev => prev.map(s => s.id === editingStaff.id ? updatedStaff : s))
        setSuccess("Staff member updated successfully")
      } else {
        const newStaff = await staffAPI.create({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          isAdmin: formData.isAdmin,
          permissions: formData.permissions,
          password: "@Changeme2"
        })
        setStaffMembers(prev => [...prev, newStaff])
        setSuccess("Staff member created successfully")
      }
      resetForm()
    } catch (error) {
      console.error('Failed to save staff:', error)
      setError(editingStaff ? 'Failed to update staff member' : 'Failed to create staff member')
    }
  }

  const handleDelete = async (staff: StaffMember) => {
    // I prevent users from deleting themselves
    if (currentUser && staff && currentUser.email === staff.email) {
      setError("You cannot delete your own account")
      return
    }

    if (!window.confirm(`Are you sure you want to delete ${staff.name}?`)) {
      return
    }

    try {
      await staffAPI.delete(staff.id)
      setStaffMembers(prev => prev.filter(s => s.id !== staff.id))
      setSuccess("Staff member deleted successfully")
    } catch (error) {
      console.error('Failed to delete staff:', error)
      setError('Failed to delete staff member')
    }
  }

  // Helper: I want to enforce strong passwords for user password changes
  function isStrongPassword(pw: string) {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(pw)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordError("All password fields are required.")
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.")
      return
    }
    if (!isStrongPassword(passwordForm.new)) {
      setPasswordError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.")
      return
    }
    setPasswordLoading(true)
    try {
      // I call the userAPI to change the password for the current user
      await userAPI.changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new
      })
      setPasswordSuccess("Password changed successfully.")
      setPasswordForm({ current: "", new: "", confirm: "" })
    } catch (err: unknown) {
      // I check if the error is an object with a message property
      if (typeof err === "object" && err !== null && "message" in err && typeof (err as { message: unknown }).message === "string") {
        setPasswordError((err as { message: string }).message)
      } else {
        setPasswordError("Failed to change password.")
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-8 p-4">{/* I let content expand to full width for better desktop usage */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Loading Staff Members</h3>
                <p className="text-gray-600">Please wait while we fetch the team data...</p>
              </div>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8 p-2 sm:p-4">{/* I adjust spacing and padding for mobile */}
      <Card className="shadow-lg border border-gray-200">
        <CardContent className="p-4 sm:p-6">{/* I reduce padding on mobile */}
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0 mb-6 pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span>Staff Management</span>
              </h2>
              <p className="text-gray-600">
                Manage team members and their access permissions
              </p>
            </div>
            <Button 
              onClick={() => {
                setShowForm(true)
                clearMessages()
              }}
              className="bg-blue-600 text-white hover:bg-blue-700 font-semibold w-full sm:w-auto shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Staff
            </Button>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
              {success}
            </div>
          )}
          
          <div className="space-y-6">
            {staffMembers.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">No Staff Members Yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Get started by adding your first team member. They&apos;ll be able to access the system based on the permissions you set.
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setShowForm(true)
                    clearMessages()
                  }}
                  className="bg-blue-600 hover:bg-blue-700 font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Staff Member
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {staffMembers.map((staff) => (
                  <div
                    key={staff.id}
                    className="group relative bg-white border border-gray-200 rounded-xl p-3 sm:p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-300 transition-all duration-300 hover:shadow-md"
                  >
                    {/* Mobile-First Layout: compact on mobile */}
                    <div className="flex flex-col sm:space-y-4 space-y-2">
                      {/* Header Section - Avatar, Name, and Badges */}
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-lg shadow-lg">
                            {staff.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="space-y-1 sm:space-y-1">
                            <h3 className="text-base sm:text-xl font-semibold text-gray-900 leading-tight truncate">{staff.name}</h3>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              {staff.isAdmin && (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300 font-medium shadow-sm text-xs">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                              {staff.role && (
                                <Badge variant="outline" className="text-gray-700 border-gray-300 bg-gray-50 text-xs">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  {staff.role}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Contact and Permissions: single line on mobile */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-xs sm:text-sm text-gray-600 mt-1 sm:mt-0">
                        <div className="flex items-center mb-1 sm:mb-0">
                          <Mail className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{staff.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{staff.permissions.join(', ')}</span>
                        </div>
                      </div>
                      {/* Action Buttons - horizontal row, compact on mobile */}
                      <div className="pt-2 sm:pt-2 border-t border-gray-100 mt-2 sm:mt-3">
                        <div className="flex flex-row gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 sm:flex-none min-w-0 sm:min-w-[100px] border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm text-xs sm:text-sm py-2"
                            onClick={() => handleEdit(staff)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            <span className="hidden xs:inline">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none min-w-0 sm:min-w-[110px] border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-colors shadow-sm text-xs sm:text-sm py-2"
                            onClick={() => handlePasswordReset(staff)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            <span className="hidden xs:inline">Reset</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
            }
          </div>
        </CardContent>
      </Card>

      {/* Self Password Change Section */}
      {currentUser && (
        <Card className="shadow-lg border border-gray-200">
          <CardContent className="p-4 sm:p-8">{/* I reduce padding on mobile for better fit */}
            {/* Header Section */}
            <div className="text-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Change Your Password</h2>
              <p className="text-gray-600 text-sm sm:text-base">Update your own account password securely</p>
            </div>
            
            <div className="w-full max-w-xs sm:max-w-md mx-auto">{/* I make the form fit better on mobile */}
              <form onSubmit={handlePasswordChange} className="space-y-4 sm:space-y-6">
                {passwordError && (
                  <div className="p-3 sm:p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center space-x-2 text-xs sm:text-sm">
                    <X className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 sm:p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center space-x-2 text-xs sm:text-sm">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="current-password" className="text-xs sm:text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Current Password</span>
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      autoComplete="current-password"
                      value={passwordForm.current}
                      onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                      className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2"
                      placeholder="Enter your current password"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-password" className="text-xs sm:text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>New Password</span>
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.new}
                      onChange={e => setPasswordForm(f => ({ ...f, new: e.target.value }))}
                      className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2"
                      placeholder="Enter your new password"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password" className="text-xs sm:text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Confirm New Password</span>
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.confirm}
                      onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                      className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2"
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200 text-xs sm:text-sm">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-blue-800">
                      <p className="font-medium mb-1">Password Requirements</p>
                      <ul className="space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• Include uppercase and lowercase letters</li>
                        <li>• Include at least one number</li>
                        <li>• Include at least one special character</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700 w-full font-semibold py-2 sm:py-3 shadow-lg text-xs sm:text-base" 
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Changing Password...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Change Password</span>
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Management Modal - Fixed positioning for proper visibility */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 overflow-hidden">
          <div className="h-full w-full overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header - Fixed at top */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                          {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                        </h2>
                        <p className="text-sm text-gray-500 leading-tight mt-1">
                          {editingStaff ? 'Update staff member information and permissions' : 'Create a new account for a team member'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetForm}
                      className="text-gray-400 hover:text-gray-600 p-2 flex-shrink-0"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {!editingStaff && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-2">
                        <Settings className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Default Password</p>
                          <p>New staff members will receive the password: <code className="bg-blue-100 px-1 rounded text-xs">@Changeme2</code></p>
                          <p className="text-blue-600 mt-1">They should change this on first login.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Content */}
                <div className="px-6 py-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <User className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>First Name</span>
                          </Label>
                          <Input 
                            id="firstName" 
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Enter first name" 
                            required 
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>Last Name</span>
                          </Label>
                          <Input 
                            id="lastName" 
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Enter last name" 
                            required 
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>Email Address</span>
                          </Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter email address" 
                            required 
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="role" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                            <Briefcase className="h-4 w-4" />
                            <span>Role/Title</span>
                          </Label>
                          <Input 
                            id="role" 
                            value={formData.role}
                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            placeholder="Enter role or leave blank" 
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <div className="flex items-center space-x-2 mb-4">
                        <Shield className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900">Permissions & Access</h3>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">
                              Base Permissions
                            </Label>
                            <div className="flex flex-wrap gap-3">
                              <label className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.permissions.includes('read')}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        permissions: [...prev.permissions.filter(p => p !== 'read'), 'read']
                                      }))
                                    } else {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        permissions: prev.permissions.filter(p => p !== 'read')
                                      }))
                                    }
                                  }}
                                  className="rounded text-blue-600 focus:ring-blue-500 flex-shrink-0"
                                />
                                <span className="text-sm font-medium text-gray-700">Read Access</span>
                                <Badge variant="secondary" className="text-xs">View data</Badge>
                              </label>

                              <label className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.permissions.includes('write')}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        permissions: [...prev.permissions.filter(p => p !== 'write'), 'write']
                                      }))
                                    } else {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        permissions: prev.permissions.filter(p => p !== 'write')
                                      }))
                                    }
                                  }}
                                  className="rounded text-blue-600 focus:ring-blue-500 flex-shrink-0"
                                />
                                <span className="text-sm font-medium text-gray-700">Write Access</span>
                                <Badge variant="secondary" className="text-xs">Modify data</Badge>
                              </label>
                            </div>
                          </div>

                          {/* Admin Permission */}
                          {currentUser?.permissions?.includes('admin') && (
                            <div className="pt-4 border-t border-gray-200">
                              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                                Administrator Access
                              </Label>
                              <label className="flex items-center space-x-3 bg-orange-50 px-4 py-3 rounded-lg border border-orange-200 hover:border-orange-300 transition-colors cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.isAdmin}
                                  onChange={(e) => setFormData(prev => ({ ...prev, isAdmin: e.target.checked }))}
                                  className="rounded text-orange-600 focus:ring-orange-500 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium text-orange-800 block">Administrator</span>
                                  <span className="text-xs text-orange-600">Full system access and user management</span>
                                </div>
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                                  Admin Only
                                </Badge>
                              </label>
                            </div>
                          )}

                          {/* Permission Info */}
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-start space-x-2">
                              <Settings className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Default Settings</p>
                                <p>All users receive Read/Write permissions by default. Only administrators can modify user permissions and access sensitive settings.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                      >
                        {editingStaff ? 'Update Staff Member' : 'Create Staff Member'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={resetForm}
                        className="flex-1 sm:flex-none"
                      >
                        Cancel
                      </Button>
                      {editingStaff && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          onClick={() => handleDelete(editingStaff)}
                          className="flex-1 sm:flex-none"
                          disabled={!!(currentUser && editingStaff && currentUser.email === editingStaff.email)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {currentUser && editingStaff && currentUser.email === editingStaff.email ? 'Cannot Delete Self' : 'Delete Staff'}
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
