/*
  Warnings:

  - Made the column `line1` on table `sellers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `sellers` MODIFY `line1` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `sellers` ADD CONSTRAINT `sellers_line1_fkey` FOREIGN KEY (`line1`) REFERENCES `city`(`city_name`) ON DELETE RESTRICT ON UPDATE CASCADE;
