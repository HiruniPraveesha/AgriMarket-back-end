/*
  Warnings:

  - A unique constraint covering the columns `[contactNo]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `users_contactNo_key` ON `users`(`contactNo`);
