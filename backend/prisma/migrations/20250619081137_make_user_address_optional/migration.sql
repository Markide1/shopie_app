/*
  Warnings:

  - Added the required column `address` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postalCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "postalCode" TEXT;
