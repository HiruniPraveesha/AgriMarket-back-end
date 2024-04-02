-- CreateTable
CREATE TABLE `wallet` (
    `wallet_id` INTEGER NOT NULL AUTO_INCREMENT,
    `buyerId` INTEGER NOT NULL,
    `walletBal` DOUBLE NOT NULL,
    `ReachargeAmt` DOUBLE NOT NULL,

    UNIQUE INDEX `wallet_wallet_id_key`(`wallet_id`),
    PRIMARY KEY (`wallet_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
