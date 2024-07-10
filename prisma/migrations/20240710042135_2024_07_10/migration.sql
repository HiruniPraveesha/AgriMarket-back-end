/*
  Warnings:

  - You are about to drop the column `productName` on the `calendarevents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `calendarevents` DROP COLUMN `productName`;

-- AlterTable
ALTER TABLE `sellerbankverification` ADD COLUMN `idNumber` VARCHAR(191) NULL;
