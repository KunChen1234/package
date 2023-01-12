/*
  Warnings:

  - A unique constraint covering the columns `[userID]` on the table `LoginInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LoginInfo_userID_key" ON "LoginInfo"("userID");
