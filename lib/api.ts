// API utility functions for frontend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : '/api'

// Auth API functions
export const authAPI = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_BASE_URL}/interactions`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch interactions')
    }
    
    return response.json()
  },

  async getById(id: number) {
    const response = await fetch(`${API_BASE_URL}/interactions/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch interaction')
    }
    
    return response.json()
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create interaction')
    }
    
    return response.json()
  },

  async update(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/interactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_BASE_URL}/students`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch students')
    }
    
    return response.json()
  },

  async create(data: { id: string; name: string; program: string }) {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create student')
    }
    
    return response.json()
  }
}

// Convenience functions for easy import
export const login = authAPI.login
export const logout = authAPI.logout
