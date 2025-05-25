import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Maps a string icon name to the corresponding Lucide icon component
 * Used for resolving icon names stored in the database to actual React components
 * 
 * @param iconName - The name of the Lucide icon
 * @param fallbackIcon - Optional fallback icon if the requested one isn't found
 * @returns A Lucide icon component
 */
export function resolveIconComponent(iconName?: string, fallbackIcon: LucideIcon = LucideIcons.HelpCircle): React.ElementType {
  if (!iconName) return fallbackIcon
  
  // Try to find the icon in Lucide components
  const icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName]
  return icon || fallbackIcon
}
