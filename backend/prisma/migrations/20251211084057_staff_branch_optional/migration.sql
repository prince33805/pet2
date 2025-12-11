-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_branchId_fkey";

-- AlterTable
ALTER TABLE "Staff" ALTER COLUMN "branchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
