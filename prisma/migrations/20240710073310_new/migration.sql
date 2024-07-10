-- AddForeignKey
ALTER TABLE `calendarEvents` ADD CONSTRAINT `calendarEvents_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
