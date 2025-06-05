// -----------------------------------------------------------------------------
// lib/data.ts
// This file centralizes all mock data used throughout the application.
// It serves as a single source of truth for data that will eventually
// be replaced by actual database calls.
// 
// For components that need to render UI elements like icons, we store string
// names that can be resolved to actual React components at render time using
// the resolveIconComponent utility function from lib/utils.ts.
//
// Future devs: When implementing a database, you'll want to convert these
// exports into async functions that fetch from your database instead.
// For example:
//
// export async function getStudents(): Promise<Student[]> {
//   return db.student.findMany();
// }
//
// See DATA_LAYER.md for full implementation details and database migration path.
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

export const programData: ProgramData[] = [
  { program: "Foundations", students: 8, interactions: 24, successRate: 87 },
  { program: "101", students: 6, interactions: 18, successRate: 92 },
  { program: "Lightspeed", students: 5, interactions: 15, successRate: 85 },
  { program: "Liftoff", students: 4, interactions: 12, successRate: 90 },
]

export const staffPerformance: StaffPerformanceData[] = [
  { firstName: "Tahir", lastName: "Lee", interactions: 28, avgRating: 4.8, followUpRate: 95 },
  { firstName: "Barbara", lastName: "Cicalese", interactions: 25, avgRating: 4.9, followUpRate: 98 },
  { firstName: "Charles", lastName: "Mitchell", interactions: 22, avgRating: 4.7, followUpRate: 92 },
]

export const interactionTypes: InteractionType[] = [
  { type: "Coaching", count: 32, percentage: 45, trend: "up" },
  { type: "Academic Support", count: 18, percentage: 25, trend: "up" },
  { type: "Career Counseling", count: 12, percentage: 17, trend: "stable" },
  { type: "Performance Improvement", count: 6, percentage: 8, trend: "down" },
  { type: "Behavioral Intervention", count: 4, percentage: 5, trend: "down" },
]

// Dashboard page data
export const interactions: Interaction[] = [
  {
    id: 1,
    studentName: "Micheal Newman",
    studentId: "0001",
    program: "foundations",
    type: "Coaching",
    reason: "Job interview preparation",
    notes:
      "Worked on interview skills, practiced common questions, discussed professional attire. Student showed good progress and confidence.",
    date: "2024-12-12",
    time: "10:30 AM",
    staffMember: "Tahir Lee",
    status: "completed",
    followUp: { required: true, date: "2024-12-20", overdue: false, sent: false },
    aiSummary:
      "Student received coaching on interview preparation with focus on confidence building and professional presentation.",
  },
  {
    id: 2,
    studentName: "Amira Johnson",
    studentId: "0002",
    program: "101",
    type: "Academic Support",
    reason: "Course planning assistance",
    notes:
      "Reviewed current course load, discussed upcoming semester options, identified areas needing additional support.",
    date: "2024-12-11",
    time: "2:15 PM",
    staffMember: "Barbara Cicalese",
    status: "completed",
    followUp: { required: true, date: "2024-12-18", overdue: false, sent: false },
    aiSummary:
      "Academic planning session focused on course selection and identifying support needs for upcoming semester.",
  },
  {
    id: 3,
    studentName: "Koleona Smith",
    studentId: "0003",
    program: "lightspeed",
    type: "Career Counseling",
    reason: "Industry exploration",
    notes:
      "Explored different career paths in technology, discussed internship opportunities, reviewed portfolio development.",
    date: "2024-12-10",
    time: "11:00 AM",
    staffMember: "Charles Mitchell",
    status: "completed",
    followUp: { required: false, sent: false },
    aiSummary:
      "Career exploration session covering technology industry opportunities and portfolio development strategies.",
  },
  {
    id: 4,
    studentName: "Zaire Williams",
    studentId: "0004",
    program: "liftoff",
    type: "Performance Improvement",
    reason: "Attendance improvement",
    notes:
      "Discussed attendance patterns, identified barriers to consistent attendance, developed action plan for improvement.",
    date: "2024-12-09",
    time: "9:45 AM",
    staffMember: "Tahir Lee",
    status: "completed",
    followUp: { required: true, date: "2024-12-15", overdue: true, sent: false },
    aiSummary:
      "Performance improvement plan established to address attendance issues with specific action items and timeline.",
  },
]

export const students: Student[] = [
  { id: "all", firstName: "All", lastName: "Students" },
  { id: "0001", firstName: "Micheal", lastName: "Newman", email: "michael.newman@example.com" },
  { id: "0002", firstName: "Amira", lastName: "Johnson", email: "amira.johnson@example.com" },
  { id: "0003", firstName: "Koleona", lastName: "Smith", email: "koleona.smith@example.com" },
  { id: "0004", firstName: "Zaire", lastName: "Williams", email: "zaire.williams@example.com" },
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

// Dashboard AI insights and notes
export const aiInsights: AiInsight[] = [
  {
    type: "trend",
    title: "Attendance Patterns",
    description: "3 students showing improved attendance after coaching sessions",
    severity: "positive",
    icon: "TrendingUp",
  },
  {
    type: "alert",
    title: "Follow-up Required",
    description: "Zaire Williams has missed 2 scheduled follow-ups",
    severity: "warning",
    icon: "AlertTriangle",
  },
  {
    type: "insight",
    title: "Program Success",
    description: "Lightspeed program students show 85% engagement rate",
    severity: "positive",
    icon: "Users",
  },
  {
    type: "recommendation",
    title: "Intervention Needed",
    description: "Consider group coaching for time management skills",
    severity: "info",
    icon: "MessageSquare",
  },
]

export const recentNotes: StaffNote[] = [
  {
    id: 1,
    author: "Tahir Lee",
    content:
      "Need to follow up on Micheal's interview preparation. He's showing great progress but needs confidence building.",
    timestamp: "2 hours ago",
    priority: "high",
  },
  {
    id: 2,
    author: "Barbara Cicalese",
    content: "Amira is excelling in academic support. Consider advancing her to next program level.",
    timestamp: "4 hours ago",
    priority: "medium",
  },
  {
    id: 3,
    author: "Charles Mitchell",
    content: "Group session on career exploration was very successful. Students engaged well.",
    timestamp: "1 day ago",
    priority: "low",
  },
]

// Login and Settings page data - for fallback/demo purposes
export const staffMembers: StaffMember[] = [
  {
    id: "1",
    firstName: "Barbara",
    lastName: "Cicalese",
    name: "Barbara Cicalese",
    email: "barbara@launchpad.org",
    role: "Senior Counselor",
    permissions: ["read", "write"],
    isAdmin: true,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    firstName: "Tahir",
    lastName: "Lee",
    name: "Tahir Lee",
    email: "tahir@launchpad.org",
    role: "Workforce Coordinator",
    permissions: ["read", "write"],
    isAdmin: true,
    createdAt: "2024-02-10"
  },
  {
    id: "3",
    firstName: "Charles",
    lastName: "Mitchell",
    name: "Charles Mitchell",
    email: "charles@launchpad.org",
    role: "Program Manager",
    permissions: ["read", "write"],
    isAdmin: false,
    createdAt: "2024-03-05"
  },
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

// This data can be used for database initialization, but not for direct rendering
export const systemIntegrationData: SystemIntegrationData[] = [
  {
    name: "Playlab AI",
    description: "AI-powered interaction summaries and insights",
    status: "connected",
    lastSync: "5 minutes ago",
  },
  {
    name: "Database Connection",
    description: "A test to ensure database connectivity",
    status: "active",
    lastSync: "12 hours ago",
  },
]

// Settings page default values
export const defaultSystemSettings: SystemSettingsState = {
  autoBackup: true,
  aiSummaries: true,
  dataRetention: "2years",
  sessionTimeout: "8hours",
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
  if (typeof window === 'undefined') return interactions // SSR fallback
  
  try {
    const response = await fetch('/api/interactions')
    if (!response.ok) {
      console.error('Failed to fetch interactions, falling back to mock data')
      return interactions
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching interactions:', error)
    return interactions // Fallback to mock data
  }
}

/**
 * Get a single interaction by id from the database via API.
 * Returns undefined if not found.
 */
export async function getInteractionById(id: number): Promise<Interaction | undefined> {
  if (typeof window === 'undefined') {
    return interactions.find((i) => i.id === id) // SSR fallback
  }
  
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

// Alias for form usage: allows other modules to import formStudents for clarity
export const formStudents = students;


