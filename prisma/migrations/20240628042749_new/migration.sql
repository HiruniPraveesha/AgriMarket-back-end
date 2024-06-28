-- CreateTable
CREATE TABLE `buyers` (
    `buyer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `contactNo` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NULL,
    `otpExpiresAt` DATETIME(3) NULL,

    UNIQUE INDEX `buyers_email_key`(`email`),
    UNIQUE INDEX `buyers_contactNo_key`(`contactNo`),
    PRIMARY KEY (`buyer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passwordResetTokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `userType` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `passwordResetTokens_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sellers` (
    `seller_id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `line1` VARCHAR(191) NULL,
    `line2` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `contactNo` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `OTP` VARCHAR(191) NULL,
    `otpExpiresAt` DATETIME(3) NULL,
    `emailVerified` BOOLEAN NOT NULL,
    `profilePic` VARCHAR(191) NULL,

    UNIQUE INDEX `sellers_email_key`(`email`),
    UNIQUE INDEX `sellers_contactNo_key`(`contactNo`),
    PRIMARY KEY (`seller_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SellerBankVerification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seller_id` INTEGER NOT NULL,
    `idFrontPhoto` VARCHAR(191) NULL,
    `idBackPhoto` VARCHAR(191) NULL,
    `bankBookPhoto` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `accountHolder` VARCHAR(191) NULL,
    `bankCode` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,

    UNIQUE INDEX `SellerBankVerification_id_key`(`id`),
    UNIQUE INDEX `SellerBankVerification_seller_id_key`(`seller_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `sellerId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `quantityLimit` INTEGER NOT NULL,

    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewAndRating` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(191) NOT NULL,
    `productId` INTEGER NOT NULL,
    `buyerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SellerBankVerification` ADD CONSTRAINT `SellerBankVerification_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `sellers`(`seller_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `product_category` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `product_seller` FOREIGN KEY (`sellerId`) REFERENCES `sellers`(`seller_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewAndRating` ADD CONSTRAINT `ReviewAndRating_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewAndRating` ADD CONSTRAINT `ReviewAndRating_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `buyers`(`buyer_id`) ON DELETE CASCADE ON UPDATE CASCADE;
