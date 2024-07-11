/*
  Warnings:

  - You are about to drop the column `productName` on the `calendarevents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `calendarevents` DROP COLUMN `productName`,
    ADD COLUMN `cartBuyerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `calendarEvents` ADD CONSTRAINT `calendarEvents_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendarEvents` ADD CONSTRAINT `calendarEvents_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendarEvents` ADD CONSTRAINT `calendarEvents_cartBuyerId_fkey` FOREIGN KEY (`cartBuyerId`) REFERENCES `cart`(`buyerId`) ON DELETE SET NULL ON UPDATE CASCADE;
