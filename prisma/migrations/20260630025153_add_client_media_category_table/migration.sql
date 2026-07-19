/*
  Warnings:

  - You are about to drop the column `category` on the `ClientMedia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClientMedia" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "ClientMediaCategory" (
    "id" TEXT NOT NULL,
    "clientPageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientMediaCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientMediaCategory_clientPageId_idx" ON "ClientMediaCategory"("clientPageId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientMediaCategory_clientPageId_name_key" ON "ClientMediaCategory"("clientPageId", "name");

-- CreateIndex
CREATE INDEX "ClientMedia_categoryId_idx" ON "ClientMedia"("categoryId");

-- AddForeignKey
ALTER TABLE "ClientMediaCategory" ADD CONSTRAINT "ClientMediaCategory_clientPageId_fkey" FOREIGN KEY ("clientPageId") REFERENCES "ClientPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMedia" ADD CONSTRAINT "ClientMedia_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ClientMediaCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
