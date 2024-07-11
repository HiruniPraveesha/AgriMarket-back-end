/*
  Warnings:

  - You are about to drop the column `otpExpireAt` on the `buyers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `buyers` DROP COLUMN `otpExpireAt`,
    ADD COLUMN `otpExpiresAt` DATETIME(3) NULL;
