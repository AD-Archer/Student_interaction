/**
 * Student Interaction Formula Utilities
 * Provides functions to calculate when students need interaction based on configurable
 * program-specific timeframes and priority escalation rules. This connects to the
 * SystemSettings model to use administrator-defined interaction frequencies.
 */

import { db } from './db'

export interface InteractionFormula {
  defaultInteractionDays: number
  foundationsInteractionDays: number
  liftoffInteractionDays: number
  lightspeedInteractionDays: number
  program101InteractionDays: number
  priorityEscalationDays: number
  enablePriorityEscalation: boolean
  followUpGracePeriodDays: number
  autoFollowUpEnabled: boolean
}

// I get the current system settings for interaction formulas
export async function getInteractionFormula(): Promise<InteractionFormula> {
  try {
    // Try to get any settings record first
    const settings = await db.systemSettings.findFirst()

    // Check if new fields exist on the settings object, otherwise use defaults
    if (settings && 'defaultInteractionDays' in settings) {
      // New fields exist, use them with proper typing
      const settingsWithNewFields = settings as typeof settings & {
        defaultInteractionDays?: number
        foundationsInteractionDays?: number
        liftoffInteractionDays?: number
        lightspeedInteractionDays?: number
        program101InteractionDays?: number
        priorityEscalationDays?: number
        enablePriorityEscalation?: boolean
        followUpGracePeriodDays?: number
        autoFollowUpEnabled?: boolean
      }
      
      return {
        defaultInteractionDays: settingsWithNewFields.defaultInteractionDays ?? 30,
        foundationsInteractionDays: settingsWithNewFields.foundationsInteractionDays ?? 14,
        liftoffInteractionDays: settingsWithNewFields.liftoffInteractionDays ?? 21,
        lightspeedInteractionDays: settingsWithNewFields.lightspeedInteractionDays ?? 7,
        program101InteractionDays: settingsWithNewFields.program101InteractionDays ?? 30,
        priorityEscalationDays: settingsWithNewFields.priorityEscalationDays ?? 7,
        enablePriorityEscalation: settingsWithNewFields.enablePriorityEscalation ?? true,
        followUpGracePeriodDays: settingsWithNewFields.followUpGracePeriodDays ?? 3,
        autoFollowUpEnabled: settingsWithNewFields.autoFollowUpEnabled ?? true
      }
    }

    // Return defaults if no settings exist or new fields don't exist yet
    return {
      defaultInteractionDays: 30,
      foundationsInteractionDays: 14,
      liftoffInteractionDays: 21,
      lightspeedInteractionDays: 7,
      program101InteractionDays: 30,
      priorityEscalationDays: 7,
      enablePriorityEscalation: true,
      followUpGracePeriodDays: 3,
      autoFollowUpEnabled: true
    }
  } catch (error) {
    console.error('Error fetching interaction formula settings:', error)
    // Return safe defaults if database is unavailable
    return {
      defaultInteractionDays: 30,
      foundationsInteractionDays: 14,
      liftoffInteractionDays: 21,
      lightspeedInteractionDays: 7,
      program101InteractionDays: 30,
      priorityEscalationDays: 7,
      enablePriorityEscalation: true,
      followUpGracePeriodDays: 3,
      autoFollowUpEnabled: true
    }
  }
}

// I calculate the interaction deadline for a specific student program
export function getInteractionDaysForProgram(program: string, formula: InteractionFormula): number {
  const normalizedProgram = program.toLowerCase()
  
  switch (normalizedProgram) {
    case 'foundations':
      return formula.foundationsInteractionDays
    case 'liftoff':
      return formula.liftoffInteractionDays
    case 'lightspeed':
      return formula.lightspeedInteractionDays
    case '101':
      return formula.program101InteractionDays
    default:
      return formula.defaultInteractionDays
  }
}

// I determine if a student needs interaction based on their last interaction date
export function doesStudentNeedInteraction(
  lastInteractionDate: Date | null,
  program: string,
  formula: InteractionFormula
): { needsInteraction: boolean; isPriority: boolean; daysSinceLastInteraction: number } {
  const now = new Date()
  const interactionDays = getInteractionDaysForProgram(program, formula)
  
  // If no previous interaction, they definitely need one
  if (!lastInteractionDate) {
    return {
      needsInteraction: true,
      isPriority: true, // No interaction ever is high priority
      daysSinceLastInteraction: Infinity
    }
  }

  // Calculate days since last interaction
  const timeDiff = now.getTime() - lastInteractionDate.getTime()
  const daysSinceLastInteraction = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

  const needsInteraction = daysSinceLastInteraction >= interactionDays
  const isPriority = formula.enablePriorityEscalation && 
    daysSinceLastInteraction >= (interactionDays + formula.priorityEscalationDays)

  return {
    needsInteraction,
    isPriority,
    daysSinceLastInteraction
  }
}

// I get students who need interaction based on the current formula
export async function getStudentsNeedingInteraction(whereClause: Record<string, unknown> = {}) {
  try {
    const formula = await getInteractionFormula()
    
    // Get all students with their most recent interaction
    const students = await db.student.findMany({
      where: whereClause,
      include: {
        interactions: {
          where: {
            isArchived: false
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    const studentsNeedingInteraction = students
      .map(student => {
        const lastInteraction = student.interactions[0]
        const lastInteractionDate = lastInteraction ? lastInteraction.createdAt : null
        
        const result = doesStudentNeedInteraction(lastInteractionDate, student.program, formula)
        
        return {
          ...student,
          needsInteraction: result.needsInteraction,
          isPriority: result.isPriority,
          daysSinceLastInteraction: result.daysSinceLastInteraction,
          lastInteractionDate
        }
      })
      .filter(student => student.needsInteraction)
      .sort((a, b) => {
        // Sort by priority first, then by days since last interaction
        if (a.isPriority && !b.isPriority) return -1
        if (!a.isPriority && b.isPriority) return 1
        return b.daysSinceLastInteraction - a.daysSinceLastInteraction
      })

    return studentsNeedingInteraction
  } catch (error) {
    console.error('Error getting students needing interaction:', error)
    return []
  }
}

// I check if a follow-up is overdue based on formula settings
export function isFollowUpOverdue(followUpDate: string, formula: InteractionFormula): boolean {
  if (!formula.autoFollowUpEnabled || !followUpDate) return false
  
  const followUpDateTime = new Date(followUpDate)
  const now = new Date()
  
  // Add grace period to follow-up date
  const overdueDateTime = new Date(followUpDateTime)
  overdueDateTime.setDate(overdueDateTime.getDate() + formula.followUpGracePeriodDays)
  
  return now > overdueDateTime
}
