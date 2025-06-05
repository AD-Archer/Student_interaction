// -----------------------------------------------------------------------------
// lib/data.ts
// This file centralizes all type definitions and database CRUD utilities for the app.
// All data must be fetched from the backend/database via API routes—no mock data is present.
// For SSR or error fallback, we return empty arrays or undefined/null as appropriate.
// If you see empty data, check your API/database connection.
// -----------------------------------------------------------------------------

// Types
// User type for authentication used across auth-wrapper and header components
export interface User {
  email: string
  firstName: string
  lastName: string
  role: string
  /**
   * Permissions array for robust role-based access control. This is populated from the backend and
   * should always reflect the user's current permissions. Use this for all admin checks in the UI.
   */
  permissions: string[]
}

export interface InteractionTrend {
  month: string
  interactions: number
  followUps: number
}

export interface ProgramData {
  program: string
  students: number
  interactions: number
  successRate: number
}

export interface StaffPerformanceData {
  firstName: string
  lastName: string
  interactions: number
  avgRating: number
  followUpRate: number
}

export interface InteractionType {
  type: string
  count: number
  percentage: number
  trend: "up" | "down" | "stable"
}

export interface Interaction {
  id: number
  studentName: string
  studentId: string
  program: string
  type: string
  reason: string
  notes: string
  date: string
  time: string
  staffMember: string
  status: string
  followUp: {
    required: boolean
    date?: string
    overdue?: boolean
    sent?: boolean // Track if follow-up email has been sent
    student?: boolean // Track if follow-up should be sent to student
    staff?: boolean // Track if follow-up should be sent to staff
    studentEmail?: string // Student email for follow-up
    staffEmail?: string // Staff email for follow-up
  }
  aiSummary: string
  isArchived?: boolean // I add this to support archiving interactions
}

export interface Student {
  id: string
  firstName: string
  lastName: string
  program?: string // Adding program for form component
  staff?: string // Adding staff to associate students with staff members
  email?: string // student's email for follow-up
}

export interface InteractionTypeOption {
  value: string
  label: string
}

export interface StaffMember {
  id: string // Using string for consistency
  email: string
  firstName: string
  lastName: string
  name: string // Computed field for display
  role?: string
  permissions: string[]
  isAdmin: boolean
  createdAt?: Date | string | null
}

export interface SystemIntegration {
  name: string
  description: string
  status: string
  lastSync: string
}

// AI Insights and notes from dashboard
export interface AiInsight {
  type: string
  title: string
  description: string
  severity: "positive" | "warning" | "info" | "negative"
  icon?: string // Using string here since we'll resolve to component in the UI
}

export interface StaffNote {
  id: number
  author: string
  content: string
  timestamp: string
  priority: "high" | "medium" | "low"
}

// System settings from settings page
export interface SystemSettingsState {
  autoBackup: boolean
  aiSummaries: boolean
  dataRetention: string
  sessionTimeout: string
}

// Form data structure from components/form.tsx
export interface FormData {
  studentName: string
  studentId: string
  studentEmail?: string // email for sending follow-up
  interactionType: string
  reason: string
  notes: string
  followUpEmail: boolean
  followUpDate: string
  staffEmail?: string // override staff email for follow-up
}

// Data exports

// Analytics page data
export const interactionTrends: InteractionTrend[] = [
  { month: "Jan", interactions: 45, followUps: 12 },
  { month: "Feb", interactions: 52, followUps: 15 },
  { month: "Mar", interactions: 48, followUps: 11 },
  { month: "Apr", interactions: 61, followUps: 18 },
  { month: "May", interactions: 55, followUps: 14 },
  { month: "Jun", interactions: 67, followUps: 20 },
]


export const interactionTypeOptions: InteractionTypeOption[] = [
  { value: "all", label: "All Types" },
  { value: "coaching", label: "Coaching" },
  { value: "academic", label: "Academic Support" },
  { value: "career", label: "Career Counseling" },
  { value: "performance", label: "Performance Improvement" },
  { value: "behavioral", label: "Behavioral Intervention" },
]

// formStudents is already exported above, so I am removing this duplicate export to avoid redeclaration errors.
export const formInteractionTypes = [
  { value: "coaching", label: "Coaching | Job Readiness" },
  { value: "pip", label: "Performance Improvement Plan" },
  { value: "career", label: "Career Counseling" },
  { value: "academic", label: "Academic Support" },
  { value: "behavioral", label: "Behavioral Intervention" },
  { value: "other", label: "Other" },
]






// Note: We don't export systemIntegrations from here since the icons need to be actual React components
// In the settings page, we're keeping the direct definition of systemIntegrations with proper Lucide icon components

export interface SystemIntegrationData {
  name: string
  description: string
  status: string
  lastSync: string
  // icon is intentionally omitted here as it needs to be a React component in the UI
}



// -----------------------------------------------------------------------------
// Database CRUD utilities for Interactions
// These functions provide data access for student interactions using
// the API endpoints that connect to the database. This replaces the previous
// localStorage-based approach for persistent data storage.
// -----------------------------------------------------------------------------

/**
 * Get all interactions from the database via API.
 * Note: This is now async and should be used with await.
 */
export async function getInteractions(): Promise<Interaction[]> {
  // On SSR or error, return an empty array—no mock data fallback
  if (typeof window === 'undefined') return []
  try {
    const response = await fetch('/api/interactions')
    if (!response.ok) {
      console.error('Failed to fetch interactions, returning empty array')
      return []
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching interactions:', error)
    return []
  }
}

/**
 * Get a single interaction by id from the database via API.
 * Returns undefined if not found.
 */
export async function getInteractionById(id: number): Promise<Interaction | undefined> {
  // On SSR or error, return undefined—no mock data fallback
  if (typeof window === 'undefined') return undefined
  try {
    const response = await fetch(`/api/interactions/${id}`)
    if (!response.ok) {
      return undefined
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching interaction:', error)
    return undefined
  }
}

/**
 * Create a new interaction via API and persist it to database.
 * Returns the new interaction.
 */
export async function createInteraction(newInteraction: Omit<Interaction, 'id'>): Promise<Interaction> {
  try {
    const response = await fetch('/api/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newInteraction),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create interaction')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating interaction:', error)
    throw error
  }
}

/**
 * Update an existing interaction by id via API.
 * Returns the updated interaction, or throws an error if not found.
 */
export async function updateInteraction(id: number, updated: Partial<Interaction>): Promise<Interaction> {
  try {
    const response = await fetch(`/api/interactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updated),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update interaction')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating interaction:', error)
    throw error
  }
}

/**
 * Delete an interaction by id via API.
 */
export async function deleteInteraction(id: number): Promise<void> {
  try {
    const response = await fetch(`/api/interactions/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete interaction')
    }
  } catch (error) {
    console.error('Error deleting interaction:', error)
    throw error
  }
}


