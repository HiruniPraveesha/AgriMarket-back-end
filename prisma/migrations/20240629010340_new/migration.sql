-- DropIndex
DROP INDEX `sellers_line1_fkey` ON `sellers`;

-- AlterTable
ALTER TABLE `sellers` MODIFY `line1` VARCHAR(191) NULL;
