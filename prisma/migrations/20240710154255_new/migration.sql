/*
  Warnings:

  - You are about to drop the column `categoryCategory_id` on the `notifications` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_categoryCategory_id_fkey`;

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `categoryCategory_id`;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
