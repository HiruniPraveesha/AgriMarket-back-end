-- CreateTable
CREATE TABLE `sellers` (
    `seller_id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `line1` VARCHAR(191) NOT NULL,
    `line2` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `contactNo` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `sellers_seller_id_key`(`seller_id`),
    UNIQUE INDEX `sellers_email_key`(`email`),
    UNIQUE INDEX `sellers_contactNo_key`(`contactNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
