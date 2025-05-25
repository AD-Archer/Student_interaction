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
- `InteractionTrend`: Analytics trend data for charting
- `ProgramData`: Program performance metrics for analytics
- `StaffPerformanceData`: Staff performance metrics for analytics
- `InteractionType`: Categories of interactions with statistics
- `Interaction`: Detailed interaction records
- `Student`: Student information including program
- `InteractionTypeOption`: Dropdown options for interaction types
- `StaffMember`: Staff information with authentication and permissions
- `SystemIntegration`: External system connection details
- `FormData`: Form submission structure
- `AiInsight`: AI-generated insights for the dashboard
- `StaffNote`: Staff notes and observations from dashboard
- `SystemSettingsState`: Application settings configuration

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

## Sample Database Schema

Below is a sample Prisma schema that could be used to implement a database based on our current data structure:

```prisma
// This is a sample schema.prisma file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  role      String
  password  String
  status    String   @default("active")
  lastLogin DateTime @default(now())
  permissions String[]
  interactions Interaction[] @relation("StaffMember")
  notes     StaffNote[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Student {
  id          String   @id
  name        String
  program     String
  interactions Interaction[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Interaction {
  id          Int      @id @default(autoincrement())
  studentId   String
  student     Student  @relation(fields: [studentId], references: [id])
  type        String
  reason      String
  notes       String
  date        DateTime
  staffMemberId Int
  staffMember User    @relation("StaffMember", fields: [staffMemberId], references: [id])
  status      String
  followUpRequired Boolean @default(false)
  followUpDate DateTime?
  followUpCompleted Boolean @default(false)
  aiSummary   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model StaffNote {
  id          Int      @id @default(autoincrement())
  authorId    Int
  author      User     @relation(fields: [authorId], references: [id])
  content     String
  priority    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SystemSettings {
  id          Int      @id @default(autoincrement())
  key         String   @unique
  value       String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SystemIntegration {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  status      String
  iconName    String
  lastSync    DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AiInsight {
  id          Int      @id @default(autoincrement())
  type        String
  title       String
  description String
  severity    String
  iconName    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Special Handling Notes

### Icon Components

Some data structures reference icons that need to be rendered as React components. We handle this using our utility function in `lib/utils.ts`:

1. **Icon Resolution Utility**:
   - We've created a `resolveIconComponent` utility function that converts string icon names to actual Lucide icon components
   - This allows us to store simple string names in our data layer while rendering actual components in the UI

2. **For SystemIntegrations**:
   - The central data model uses `systemIntegrationData` with string icon names
   - In the settings page, we map this data to include actual icon components using our utility function
   - The `SystemIntegrations` component accepts the mapped data with resolved icon components

3. **For AI Insights**:
   - We store the icon name as a string in the centralized data
   - The component that renders these insights uses `resolveIconComponent` to dynamically resolve the icon names to components
   
This approach cleanly separates data concerns (what can be stored in a database) from UI concerns (React components) while providing a consistent pattern across the application.

This approach separates data concerns (what can be stored in a database) from UI concerns (React components).

## Additional Considerations

1. **Authentication**: Replace the mock login with a proper authentication system
2. **Environment Variables**: Store database connection details in environment variables
3. **Validation**: Add validation to ensure data integrity before sending to database
4. **Caching**: Consider caching strategies for frequently accessed data
5. **Error Handling**: Implement proper error handling for database operations

By following this migration path, you can smoothly transition from mock data to a real database without major architectural changes to your application.

## Implementation Progress

### Completed
- ✅ Centralized all data in `/lib/data.ts` with proper TypeScript interfaces
- ✅ Updated all components to use the centralized data
- ✅ Created consistent patterns for handling UI components like icons
- ✅ Added utility function `resolveIconComponent` to map string icon names to React components
- ✅ Documented migration path to actual database implementation

### Next Steps
1. **Database Setup**:
   - Choose a database (PostgreSQL recommended)
   - Install Prisma or another ORM
   - Create schema based on existing TypeScript interfaces

2. **API Implementation**:
   - Convert static exports to async functions
   - Implement data fetching with proper error handling
   - Add caching for performance optimization

3. **Authentication Integration**:
   - Replace mock authentication with proper auth system
   - Implement role-based access control using existing permission structure
