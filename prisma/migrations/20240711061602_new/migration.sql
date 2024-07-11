/*
  Warnings:

  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `order_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `orders` table. All the data in the column will be lost.
  - The primary key for the `wallet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ReachargeAmt` on the `wallet` table. All the data in the column will be lost.
  - You are about to drop the column `walletBal` on the `wallet` table. All the data in the column will be lost.
  - You are about to drop the column `wallet_id` on the `wallet` table. All the data in the column will be lost.
  - You are about to drop the `cart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cartproduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewardPoints` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pointBalance` to the `wallet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `calendarevents` DROP FOREIGN KEY `calendarEvents_cartBuyerId_fkey`;

-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `cart_buyerId_fkey`;

-- DropForeignKey
ALTER TABLE `cartproduct` DROP FOREIGN KEY `cartProduct_buyerId_fkey`;

-- DropForeignKey
ALTER TABLE `cartproduct` DROP FOREIGN KEY `cartProduct_productId_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `puchased_order`;

-- DropForeignKey
ALTER TABLE `wallet` DROP FOREIGN KEY `wallet_buyerId_fkey`;

-- DropIndex
DROP INDEX `wallet_wallet_id_key` ON `wallet`;

-- AlterTable
ALTER TABLE `orders` DROP PRIMARY KEY,
    DROP COLUMN `order_id`,
    DROP COLUMN `sellerId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deliveryAddress` VARCHAR(191) NULL,
    ADD COLUMN `deliveryInstructions` VARCHAR(191) NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `rewardPoints` DOUBLE NOT NULL,
    ADD COLUMN `totalAmount` DOUBLE NOT NULL,
    ADD COLUMN `usedrewardPoints` DOUBLE NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `wallet` DROP PRIMARY KEY,
    DROP COLUMN `ReachargeAmt`,
    DROP COLUMN `walletBal`,
    DROP COLUMN `wallet_id`,
    ADD COLUMN `pointBalance` DOUBLE NOT NULL,
    ADD PRIMARY KEY (`buyerId`);

-- DropTable
DROP TABLE `cart`;

-- DropTable
DROP TABLE `cartproduct`;

-- CreateTable
CREATE TABLE `OrderProduct` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_buyer` FOREIGN KEY (`buyerId`) REFERENCES `buyers`(`buyer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_buyer` FOREIGN KEY (`buyerId`) REFERENCES `buyers`(`buyer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProduct` ADD CONSTRAINT `OrderProduct_order` FOREIGN KEY (`orderId`) REFERENCES `Orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProduct` ADD CONSTRAINT `OrderProduct_product` FOREIGN KEY (`productId`) REFERENCES `Product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
