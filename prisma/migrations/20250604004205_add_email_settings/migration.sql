-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN     "adminEmail" TEXT NOT NULL DEFAULT 'admin@launchpadphilly.org',
ADD COLUMN     "bccAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fromEmail" TEXT NOT NULL DEFAULT 'noreply.lp.studentform@gmail.com',
ADD COLUMN     "fromName" TEXT NOT NULL DEFAULT 'Launchpad Student Services';
