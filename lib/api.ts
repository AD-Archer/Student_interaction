// API utility functions for frontend

// Type definitions for API data
interface CreateInteractionData {
  studentName: string
  studentId: string
  program?: string
  type: string
  reason: string
  notes: string
  date: string
  time: string
  staffMember: string
  staffMemberId: number
  aiSummary?: string
  followUp: {
    required: boolean
    date?: string
    overdue?: boolean
  }
}

interface UpdateInteractionData {
  studentName?: string
  studentId?: string
  program?: string
  type?: string
  reason?: string
  notes?: string
  date?: string
  time?: string
  staffMember?: string
  staffMemberId?: number
  aiSummary?: string
  followUp?: {
    required: boolean
    date?: string
    overdue?: boolean
  }
}

interface CreateStudentData {
  id: string
  name: string
  program: string
}

interface CreateStaffData {
  firstName?: string
  lastName?: string
  name?: string // Allow either combined name or first/last
  email: string
  role?: string
  permissions?: string[]
  isAdmin?: boolean
  password?: string
}

interface UpdateStaffData {
  firstName?: string
  lastName?: string
  name?: string // Allow either combined name or first/last
  email?: string
  role?: string
  permissions?: string[]
  isAdmin?: boolean
  password?: string
  resetPassword?: boolean
}

const API_BASE_URL = '/api'

// Auth API functions
export const authAPI = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify({ email, password }),
    })
    
    if (!response.ok) {
      // Sometimes the backend returns non-JSON (e.g., 500 error with HTML/text), so I try/catch JSON parsing
      let errorMsg = 'Login failed'
      try {
        const error = await response.json()
        errorMsg = error.error || errorMsg
      } catch {
        // If not JSON, try to get plain text for more context
        try {
          errorMsg = await response.text() || errorMsg
        } catch {
          // fallback to generic message
        }
      }
      throw new Error(errorMsg)
    }
    
    return response.json()
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session
    })
    
    if (!response.ok) {
      throw new Error('Logout failed')
    }
    
    return response.json()
  },

  async checkSession() {
    const response = await fetch(`${API_BASE_URL}/auth/session`, {
      method: 'GET',
      credentials: 'include', // Include cookies for session
    })
    
    if (!response.ok) {
      throw new Error('Session check failed')
    }
    
    return response.json()
  }
}

// Interactions API functions
export const interactionsAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/interactions`, {
      credentials: 'include', // Include cookies for session
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch interactions')
    }
    
    return response.json()
  },

  async getById(id: number) {
    const response = await fetch(`${API_BASE_URL}/interactions/${id}`, {
      credentials: 'include', // Include cookies for session
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch interaction')
    }
    
    return response.json()
  },

  async create(data: CreateInteractionData) {
    const response = await fetch(`${API_BASE_URL}/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create interaction')
    }
    
    return response.json()
  },

  async update(id: number, data: UpdateInteractionData) {
    const response = await fetch(`${API_BASE_URL}/interactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update interaction')
    }
    
    return response.json()
  },

  async delete(id: number) {
    const response = await fetch(`${API_BASE_URL}/interactions/${id}`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies for session
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete interaction')
    }
    
    return response.json()
  },

  /**
   * Fetch interactions for a specific staff member.
   * @param staffMemberId - The ID of the staff member.
   * @returns A promise resolving to the list of interactions.
   */
  async getByStaffMember(staffMemberId: number) {
    const response = await fetch(`${API_BASE_URL}/interactions?staffMemberId=${staffMemberId}`, {
      credentials: 'include', // Include cookies for session
    });

    if (!response.ok) {
      throw new Error('Failed to fetch interactions for the staff member');
    }

    return response.json();
  },

  /**
   * Fetch interactions within a specific date range.
   * @param startDate - The start date of the range.
   * @param endDate - The end date of the range.
   * @returns A promise resolving to the list of interactions.
   */
  async getByDateRange(startDate: Date, endDate: Date) {
    const response = await fetch(
      `${API_BASE_URL}/interactions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        credentials: 'include', // Include cookies for session
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch interactions for the specified date range');
    }

    return response.json();
  },
}

// Students API functions
export const studentsAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/students`, {
      credentials: 'include', // Include cookies for session
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch students')
    }
    
    return response.json()
  },

  async create(data: CreateStudentData) {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create student')
    }
    
    return response.json()
  },

  async update(id: string, data: Partial<CreateStudentData>) {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update student')
    }
    
    return response.json()
  }
}

// Staff API functions
export const staffAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/staff`, {
      credentials: 'include', // Include cookies for session
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch staff')
    }
    
    return response.json()
  },

  async create(data: CreateStaffData) {
    const response = await fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create staff member')
    }
    
    return response.json()
  },

  async update(id: string, data: UpdateStaffData) {
    const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update staff member')
    }
    
    return response.json()
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete staff member')
    }
    
    return response.json()
  },

  async resetPassword(id: string) {
    return this.update(id, { resetPassword: true })
  }
}

// User API functions
export const userAPI = {
  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error('Failed to get current user')
    }
    
    return response.json()
  },
  async changePassword({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) {
    const response = await fetch('/api/user/me/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to change password')
    }
    return response.json()
  }
}

// Interaction Types API functions
export const interactionTypesAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/interaction-types`, {
      credentials: 'include', // Include cookies for session
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch interaction types')
    }
    
    return response.json()
  }
}

// Convenience functions for easy import
export const login = authAPI.login
export const logout = authAPI.logout
