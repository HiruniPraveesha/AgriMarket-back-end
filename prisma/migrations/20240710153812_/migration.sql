/*
  Warnings:

  - You are about to drop the column `Status` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `productid` on the `notifications` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notification_about`;

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `Status`,
    DROP COLUMN `productid`,
    ADD COLUMN `categoryCategory_id` INTEGER NULL,
    ADD COLUMN `categoryId` INTEGER NOT NULL,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `productId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `notification_reads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notificationId` INTEGER NOT NULL,
    `buyerId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notification_about` FOREIGN KEY (`productId`) REFERENCES `Product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_categoryCategory_id_fkey` FOREIGN KEY (`categoryCategory_id`) REFERENCES `Category`(`category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_reads` ADD CONSTRAINT `notification_reads_notificationId_fkey` FOREIGN KEY (`notificationId`) REFERENCES `notifications`(`N_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
