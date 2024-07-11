/*
  Warnings:

  - You are about to drop the column `otpExpiresAt` on the `buyers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `buyers` DROP COLUMN `otpExpiresAt`,
    ADD COLUMN `otpExpireAt` DATETIME(3) NULL;
