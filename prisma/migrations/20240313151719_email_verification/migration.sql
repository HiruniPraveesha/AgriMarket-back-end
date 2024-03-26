/*
  Warnings:

  - Made the column `email` on table `sellers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `sellers` MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `contactNo` VARCHAR(191) NULL;
