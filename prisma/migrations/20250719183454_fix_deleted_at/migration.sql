/*
  Warnings:

  - You are about to drop the column `deleteAt` on the `Plugin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plugin" DROP COLUMN "deleteAt",
ADD COLUMN     "deletedAt" TIMESTAMP(3);
