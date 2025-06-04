/**
 * Analytics API endpoint for fetching real-time data from the database.
 * Provides comprehensive analytics including student counts, interaction metrics,
 * follow-up statistics, cohort breakdowns, and trend analysis.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cohort = searchParams.get('cohort') || 'all'
    const dateRange = searchParams.get('dateRange') || '30' // days

    // Calculate date threshold for trends
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(dateRange))

    // Base where clause for cohort filtering
    const cohortFilter = cohort === 'all' ? {} : { cohort: parseInt(cohort) }

    // Get total student counts by cohort
    const totalStudents = await db.student.count({
      where: cohortFilter
    })

    // Get students by cohort breakdown
    const studentsByCohort = await db.student.groupBy({
      by: ['cohort'],
      _count: {
        id: true
      },
      orderBy: {
        cohort: 'asc'
      }
    })

    // For interactions, we need to filter through the student relationship
    const interactionWhere = cohort === 'all' 
      ? { isArchived: false }
      : { 
          student: { cohort: parseInt(cohort) },
          isArchived: false 
        }

    // Get total interactions
    const totalInteractions = await db.interaction.count({
      where: interactionWhere
    })

    // Get interactions needing follow-up (required but not sent)
    const followUpsRequired = await db.interaction.count({
      where: {
        ...interactionWhere,
        followUpRequired: true,
        followUpSent: false
      }
    })

    // Get overdue follow-ups
    const today = new Date().toISOString().split('T')[0]
    const overdueFollowUps = await db.interaction.count({
      where: {
        ...interactionWhere,
        followUpRequired: true,
        followUpSent: false,
        followUpDate: {
          lt: today
        }
      }
    })

    // Get recent interactions (last 30 days) for trend analysis
    const recentInteractions = await db.interaction.count({
      where: {
        ...interactionWhere,
        createdAt: {
          gte: dateThreshold
        }
      }
    })

    // Get interaction types breakdown
    const interactionTypes = await db.interaction.groupBy({
      by: ['type'],
      where: interactionWhere,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Get staff performance metrics
    const staffPerformance = await db.interaction.groupBy({
      by: ['staffMember'],
      where: interactionWhere,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get monthly trend data (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTrends = await db.interaction.findMany({
      where: {
        ...interactionWhere,
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true,
        followUpRequired: true
      }
    })

    // Process monthly trends
    const trendsByMonth: Record<string, { interactions: number; followUps: number }> = {}
    monthlyTrends.forEach(interaction => {
      const monthKey = interaction.createdAt.toISOString().slice(0, 7) // YYYY-MM
      if (!trendsByMonth[monthKey]) {
        trendsByMonth[monthKey] = { interactions: 0, followUps: 0 }
      }
      trendsByMonth[monthKey].interactions++
      if (interaction.followUpRequired) {
        trendsByMonth[monthKey].followUps++
      }
    })

    // Convert to array format
    const trendsArray = Object.entries(trendsByMonth)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        ...data
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Get students who need interactions (no recent interaction)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const studentsWithRecentInteractions = await db.interaction.findMany({
      where: {
        ...interactionWhere,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        studentId: true
      },
      distinct: ['studentId']
    })

    const recentInteractionStudentIds = studentsWithRecentInteractions.map(i => i.studentId)

    const studentsNeedingInteraction = await db.student.count({
      where: {
        ...cohortFilter,
        id: {
          notIn: recentInteractionStudentIds
        }
      }
    })

    return NextResponse.json({
      overview: {
        totalStudents,
        totalInteractions,
        studentsNeedingInteraction,
        followUpsRequired,
        overdueFollowUps,
        recentInteractions
      },
      breakdown: {
        studentsByCohort: studentsByCohort.map(cohortData => ({
          cohort: cohortData.cohort || 'Unassigned',
          _count: cohortData._count
        })),
        interactionTypes: interactionTypes.map(type => ({
          type: type.type,
          count: type._count.id,
          percentage: totalInteractions > 0 ? Math.round((type._count.id / totalInteractions) * 100) : 0
        })),
        staffPerformance: staffPerformance.map(staff => ({
          staffMember: staff.staffMember,
          interactions: staff._count.id
        }))
      },
      trends: trendsArray,
      filters: {
        cohort,
        dateRange: parseInt(dateRange)
      }
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
