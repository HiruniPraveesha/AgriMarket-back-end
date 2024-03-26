-- CreateTable
CREATE TABLE `products` (
    `product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `sellerId` INTEGER NULL,
    `district` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `products_product_id_key`(`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `sellers`(`seller_id`) ON DELETE SET NULL ON UPDATE CASCADE;
