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
  name: string  
  role: string
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
  name: string
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
  }
  aiSummary: string
}

export interface Student {
  id: string
  name: string
  program?: string // Adding program for form component
  staff?: string // Adding staff to associate students with staff members
}

export interface InteractionTypeOption {
  value: string
  label: string
}

export interface StaffMember {
  id: number // Making this required for settings page
  email: string
  password: string // Required for login page
  name: string
  role: string
  status: string // Required for settings page
  lastLogin: string // Required for settings page
  permissions: string[] // Required for settings page
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
  interactionType: string
  reason: string
  notes: string
  followUpEmail: boolean
  followUpDate: string
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
  { name: "Tahir Lee", interactions: 28, avgRating: 4.8, followUpRate: 95 },
  { name: "Barbara Cicalese", interactions: 25, avgRating: 4.9, followUpRate: 98 },
  { name: "Charles Mitchell", interactions: 22, avgRating: 4.7, followUpRate: 92 },
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
    followUp: { required: true, date: "2024-12-20", overdue: false },
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
    followUp: { required: true, date: "2024-12-18", overdue: false },
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
    followUp: { required: false },
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
    followUp: { required: true, date: "2024-12-15", overdue: true },
    aiSummary:
      "Performance improvement plan established to address attendance issues with specific action items and timeline.",
  },
]

export const students: Student[] = [
  { id: "all", name: "All Students" },
  { id: "0001", name: "Micheal Newman" },
  { id: "0002", name: "Amira Johnson" },
  { id: "0003", name: "Koleona Smith" },
  { id: "0004", name: "Zaire Williams" },
]

export const interactionTypeOptions: InteractionTypeOption[] = [
  { value: "all", label: "All Types" },
  { value: "coaching", label: "Coaching" },
  { value: "academic", label: "Academic Support" },
  { value: "career", label: "Career Counseling" },
  { value: "performance", label: "Performance Improvement" },
  { value: "behavioral", label: "Behavioral Intervention" },
]

// Form page data (from components/form.tsx)
export const formInteractionTypes: InteractionTypeOption[] = [
  { value: "coaching", label: "Coaching | Job Readiness" },
  { value: "pip", label: "Performance Improvement Plan" },
  { value: "career", label: "Career Counseling" },
  { value: "academic", label: "Academic Support" },
  { value: "behavioral", label: "Behavioral Intervention" },
  { value: "other", label: "Other" },
]

export const formStudents: Student[] = [
  { id: "0001", name: "Micheal Newman", program: "foundations" },
  { id: "0002", name: "Amira Johnson", program: "101" },
  { id: "0003", name: "Koleona Smith", program: "lightspeed" },
  { id: "0004", name: "Zaire Williams", program: "liftoff" },
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

// Login and Settings page data
export const staffMembers: StaffMember[] = [
  {
    id: 1,
    name: "Barbara Cicalese",
    email: "barbara@launchpad.org",
    password: "staff123",
    role: "Senior Counselor",
    status: "active",
    lastLogin: "2 hours ago",
    permissions: ["read", "write", "admin"],
  },
  {
    id: 2,
    name: "Tahir Lee",
    email: "tahir@launchpad.org",
    password: "staff123",
    role: "Workforce Coordinator",
    status: "active",
    lastLogin: "Currently online",
    permissions: ["read", "write", "admin"],
  },
  {
    id: 3,
    name: "Charles Mitchell",
    email: "charles@launchpad.org",
    password: "staff123",
    role: "Program Manager",
    status: "active",
    lastLogin: "1 day ago",
    permissions: ["read", "write"],
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
    name: "Email System",
    description: "Automated follow-up emails and notifications",
    status: "connected",
    lastSync: "1 hour ago",
  },
  {
    name: "Database Backup",
    description: "Automated daily backups to secure cloud storage",
    status: "active",
    lastSync: "12 hours ago",
  },
  {
    name: "Analytics Engine",
    description: "Real-time data processing and reporting",
    status: "connected",
    lastSync: "Real-time",
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
// LocalStorage CRUD utilities for Interactions
// These functions provide persistent storage for student interactions using
// the browser's localStorage API. This allows the app to create, read, update,
// and list interactions without a backend. All interaction data is stored under
// the 'interactions' key in localStorage. If no data exists, we fall back to
// the initial mock data above. Future devs: Replace with real API/database calls.
// -----------------------------------------------------------------------------

/**
 * Get all interactions from localStorage, or fall back to initial mock data.
 * I use this everywhere that needs the current list of interactions.
 */
export function getInteractions(): Interaction[] {
  if (typeof window === 'undefined') return interactions // SSR fallback
  const raw = localStorage.getItem('interactions')
  if (!raw) return interactions
  try {
    return JSON.parse(raw) as Interaction[]
  } catch {
    return interactions
  }
}

/**
 * Get a single interaction by id. Returns undefined if not found.
 */
export function getInteractionById(id: number): Interaction | undefined {
  return getInteractions().find((i) => i.id === id)
}

/**
 * Create a new interaction and persist it. Returns the new interaction.
 * I auto-increment the id based on the highest current id.
 */
export function createInteraction(newInteraction: Omit<Interaction, 'id'>): Interaction {
  const all = getInteractions()
  const nextId = all.length > 0 ? Math.max(...all.map(i => i.id)) + 1 : 1
  const interaction: Interaction = { ...newInteraction, id: nextId }
  localStorage.setItem('interactions', JSON.stringify([interaction, ...all]))
  return interaction
}

/**
 * Update an existing interaction by id. Returns the updated interaction, or undefined if not found.
 */
export function updateInteraction(id: number, updated: Partial<Interaction>): Interaction | undefined {
  const all = getInteractions()
  const idx = all.findIndex(i => i.id === id)
  if (idx === -1) return undefined
  const merged = { ...all[idx], ...updated }
  all[idx] = merged
  localStorage.setItem('interactions', JSON.stringify(all))
  return merged
}

/**
 * Replace all interactions (for bulk operations or resets).
 */
export function setInteractions(newList: Interaction[]): void {
  localStorage.setItem('interactions', JSON.stringify(newList))
}
