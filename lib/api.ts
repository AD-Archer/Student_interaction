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
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
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
  }
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
