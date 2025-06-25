import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Maps a string icon name to the corresponding Lucide icon component
 * Used for resolving icon names stored in the database to actual React components
 *
 * @param iconName - The name of the Lucide icon
 * @param fallbackIcon - Optional fallback icon if the requested one isn't found
 * @returns A Lucide icon component
 */
export function resolveIconComponent(
  iconName?: string,
  fallbackIcon: LucideIcon = LucideIcons.HelpCircle
): React.ElementType {
  if (!iconName) return fallbackIcon;

  // Try to find the icon in Lucide components
  const icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName];
  return icon || fallbackIcon;
}

/**
 * Summarizes a given text using a simple algorithm or external API.
 * This function is used to generate concise summaries for AI insights.
 *
 * @param text - The text to summarize.
 * @returns A promise resolving to the summarized text.
 */
export async function summarizeText(text: string): Promise<string> {
  if (!text) return "";

  // Placeholder: Return the full text for now to avoid truncation
  return text;
}

/**
 * Given a mapping of phase->cohort (e.g. { liftoff: "1", 101: "2", foundations: "3" })
 * and a cohort number (as string or number), returns the phase name for that cohort.
 * Returns undefined if not found.
 */
export function getPhaseForCohort(cohortPhaseMap: Record<string, string>, cohort: string | number): string | undefined {
  const cohortStr = String(cohort)
  // I find the phase whose value matches the cohort
  return Object.entries(cohortPhaseMap).find(([, v]) => v === cohortStr)?.[0]
}

/**
 * Determines if a student is an alumni based on their cohort number.
 * Students are considered alumni if their cohort is lower than the current Liftoff cohort.
 * 
 * @param cohortPhaseMap - The mapping of phase->cohort (e.g. { liftoff: "1", 101: "2", foundations: "3" })
 * @param studentCohort - The student's cohort number
 * @returns true if the student is an alumni, false otherwise
 */
export function isStudentAlumni(cohortPhaseMap: Record<string, string>, studentCohort: string | number | null | undefined): boolean {
  if (!studentCohort || !cohortPhaseMap.liftoff) return false
  
  const studentCohortNum = typeof studentCohort === 'number' ? studentCohort : parseInt(String(studentCohort), 10)
  const liftoffCohortNum = parseInt(cohortPhaseMap.liftoff, 10)
  
  if (isNaN(studentCohortNum) || isNaN(liftoffCohortNum)) return false
  
  return studentCohortNum < liftoffCohortNum
}

/**
 * Gets the effective program/phase for a student, including alumni status.
 * Returns "alumni" for graduated students, or the actual phase for current students.
 * 
 * @param cohortPhaseMap - The mapping of phase->cohort
 * @param studentCohort - The student's cohort number
 * @returns The program phase or "alumni"
 */
export function getStudentProgram(cohortPhaseMap: Record<string, string>, studentCohort: string | number | null | undefined): string {
  if (isStudentAlumni(cohortPhaseMap, studentCohort)) {
    return 'alumni'
  }
  
  return getPhaseForCohort(cohortPhaseMap, studentCohort || '') || 'N/A'
}
