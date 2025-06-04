/**
 * StaffManagement.tsx
 * Full-featured staff management component with CRUD operations.
 * Connects to the /api/staff endpoints for real database operations.
 * Includes admin permission checking and self-protection features.
 * This is only used on the /settings page and is not global.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, RotateCcw, Shield, X, User, Mail, Briefcase, Settings } from "lucide-react"
import React, { useState, useEffect } from "react"
import { StaffMember } from "@/lib/data"
import { staffAPI, userAPI } from "@/lib/api"

export default function StaffManagement() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [currentUser, setCurrentUser] = useState<{ id: string; isAdmin: boolean } | null>(null)
  
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
        if (currentUser?.id === editingStaff.id && editingStaff.isAdmin && !formData.isAdmin) {
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
    if (currentUser?.id === staff.id) {
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
      <div className="w-full">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">Loading staff members...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Self password change section */}
      {currentUser && (
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Change Your Password</CardTitle>
            <CardDescription>Update your own account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              {passwordError && (
                <div className="p-2 bg-red-100 border border-red-300 text-red-700 rounded text-sm">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="p-2 bg-green-100 border border-green-300 text-green-700 rounded text-sm">{passwordSuccess}</div>
              )}
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={passwordForm.current}
                  onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.new}
                  onChange={e => setPasswordForm(f => ({ ...f, new: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.confirm}
                  onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full" disabled={passwordLoading}>
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <div>
              <CardTitle className="text-lg sm:text-xl">Staff Management</CardTitle>
              <CardDescription>Manage team members and their access permissions</CardDescription>
            </div>
            <Button 
              onClick={() => {
                setShowForm(true)
                clearMessages()
              }}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
          
          <div className="space-y-4">
            {staffMembers.map((staff) => (
              <div
                key={staff.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-6 border rounded-xl bg-gray-50 space-y-4 lg:space-y-0 transition-all hover:shadow-md"
              >
                <div className="flex-1 space-y-2 lg:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                    <h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {staff.isAdmin && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {staff.email}
                    </p>
                    {staff.role && (
                      <p className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                        {staff.role}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 sm:flex-none"
                      onClick={() => handleEdit(staff)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none text-orange-600 hover:text-orange-700"
                      onClick={() => handlePasswordReset(staff)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Password
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                          {currentUser?.isAdmin && (
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
                          disabled={currentUser?.id === editingStaff.id}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {currentUser?.id === editingStaff.id ? 'Cannot Delete Self' : 'Delete Staff'}
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
