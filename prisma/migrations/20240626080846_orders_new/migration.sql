/*
  Warnings:

  - Added the required column `Amount` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `Amount` DOUBLE NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
