/*
  Warnings:

  - Added the required column `moved_quantity` to the `PalletMovement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PalletMovement" ADD COLUMN     "moved_quantity" DOUBLE PRECISION NOT NULL;
