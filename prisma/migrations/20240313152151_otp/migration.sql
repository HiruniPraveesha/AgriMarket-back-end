/*
  Warnings:

  - You are about to drop the column `verificationToken` on the `sellers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sellers` DROP COLUMN `verificationToken`,
    ADD COLUMN `OTP` VARCHAR(191) NULL,
    ADD COLUMN `emailVerified` BOOLEAN NULL;
