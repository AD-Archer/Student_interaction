# Data Layer Documentation

## Current Implementation 

This document outlines the approach we've taken to centralize data management in the Launchpad Student Form application.

### Centralized Data Store

All mock data for the application is now centralized in `/lib/data.ts`. This file:

1. Defines TypeScript interfaces for all data types
2. Exports mock data that was previously scattered across different page components 
3. Serves as the single source of truth for data used throughout the application

### Types Defined

- `User`: Authentication user model used for login and display
- `InteractionTrend`: Analytics trend data
- `ProgramData`: Program performance metrics  
- `StaffPerformanceData`: Staff performance metrics
- `InteractionType`: Categories of interactions with statistics
- `Interaction`: Detailed interaction records
- `Student`: Student information including program
- `InteractionTypeOption`: Dropdown options for interaction types
- `StaffMember`: Staff information with authentication and permissions
- `SystemIntegration`: External system connection details
- `FormData`: Form submission structure

### Benefits of Centralization

- Consistent data structure across the application
- Eliminates duplication of data definitions
- Easier maintenance - single file to update when data structure changes
- Provides a clear migration path to real database implementation

## Database Migration Path

When implementing a real database, you should follow these steps:

### 1. Set Up Database Connection

Add a database connection module in `/lib/db.ts` (or similar). For example, with Prisma ORM:

```ts
// lib/db.ts example with Prisma
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const db = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = db
```

### 2. Create Database Schema

Define your database schema based on the TypeScript interfaces in `data.ts`. 
For example, with Prisma, you'd create a `prisma/schema.prisma` file.

### 3. Convert Data Export Functions

Replace the direct data exports with async functions that fetch from the database:

```ts
// Current implementation
export const staffMembers: StaffMember[] = [ ... ]

// Future implementation with database
export async function getStaffMembers(): Promise<StaffMember[]> {
  return db.staffMember.findMany()
}
```

### 4. Update Components

Update components to use the new async data functions. For example:

```tsx
// pages/settings/page.tsx - Current implementation
import { staffMembers } from "@/lib/data"

// Future implementation using React Server Components
import { getStaffMembers } from "@/lib/data"

export default async function SettingsPage() {
  const staffMembers = await getStaffMembers()
  // ...rest of component
}
```

### 5. Add Data Mutation Functions

Add functions for creating, updating, and deleting data:

```ts
export async function createStaffMember(data: Omit<StaffMember, 'id'>): Promise<StaffMember> {
  return db.staffMember.create({ data })
}

export async function updateStaffMember(id: number, data: Partial<StaffMember>): Promise<StaffMember> {
  return db.staffMember.update({ where: { id }, data })
}

export async function deleteStaffMember(id: number): Promise<void> {
  await db.staffMember.delete({ where: { id } })
}
```

## Additional Considerations

1. **Authentication**: Replace the mock login with a proper authentication system
2. **Environment Variables**: Store database connection details in environment variables
3. **Validation**: Add validation to ensure data integrity before sending to database
4. **Caching**: Consider caching strategies for frequently accessed data
5. **Error Handling**: Implement proper error handling for database operations

By following this migration path, you can smoothly transition from mock data to a real database without major architectural changes to your application.
