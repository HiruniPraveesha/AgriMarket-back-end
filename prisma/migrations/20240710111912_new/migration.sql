-- AddForeignKey
ALTER TABLE `calendarEvents` ADD CONSTRAINT `calendarEvents_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
