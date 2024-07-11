-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `buyers`(`buyer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
