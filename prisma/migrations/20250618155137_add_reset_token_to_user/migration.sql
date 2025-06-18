/*
  Warnings:

  - You are about to drop the column `type` on the `interactions` table. All the data in the column will be lost.
  - You are about to drop the column `program` on the `students` table. All the data in the column will be lost.
  - Added the required column `studentId` to the `staff_notes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "interactions" DROP COLUMN "type",
ADD COLUMN     "followUpStaff" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "followUpStaffEmail" TEXT,
ADD COLUMN     "followUpStudent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "followUpStudentEmail" TEXT,
ADD COLUMN     "typeId" INTEGER,
ADD COLUMN     "updatedBy" TEXT,
ALTER COLUMN "program" DROP NOT NULL;

-- AlterTable
ALTER TABLE "staff_notes" ADD COLUMN     "studentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "program",
ADD COLUMN     "altSchoolEmail" TEXT,
ADD COLUMN     "isLightspeed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPIP" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "launchpadEmail" TEXT,
ADD COLUMN     "personalEmail" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN     "aiProvider" TEXT NOT NULL DEFAULT 'auto',
ADD COLUMN     "autoFollowUpEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cohortPhaseMap" JSONB,
ADD COLUMN     "defaultInteractionDays" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "enablePriorityEscalation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "followUpGracePeriodDays" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "foundationsInteractionDays" INTEGER NOT NULL DEFAULT 14,
ADD COLUMN     "liftoffInteractionDays" INTEGER NOT NULL DEFAULT 21,
ADD COLUMN     "lightspeedInteractionDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "pipInteractionDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "priorityEscalationDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "program101InteractionDays" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "interaction_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interaction_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemIntegrationStatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lastSync" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unknown',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemIntegrationStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interaction_types_name_key" ON "interaction_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SystemIntegrationStatus_name_key" ON "SystemIntegrationStatus"("name");

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "interaction_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
