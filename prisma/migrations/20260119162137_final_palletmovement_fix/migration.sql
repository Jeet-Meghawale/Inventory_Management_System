/*
  Warnings:

  - The primary key for the `location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `location` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `palletmovement` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `location` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "palletmovement" DROP CONSTRAINT "palletmovement_from_location_id_fkey";

-- DropForeignKey
ALTER TABLE "palletmovement" DROP CONSTRAINT "palletmovement_moved_by_fkey";

-- DropForeignKey
ALTER TABLE "palletmovement" DROP CONSTRAINT "palletmovement_pallet_id_fkey";

-- DropForeignKey
ALTER TABLE "palletmovement" DROP CONSTRAINT "palletmovement_to_location_id_fkey";

-- AlterTable
ALTER TABLE "location" DROP CONSTRAINT "location_pkey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "location_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "palletmovement";

-- CreateTable
CREATE TABLE "PalletMovement" (
    "id" SERIAL NOT NULL,
    "pallet_id" TEXT NOT NULL,
    "from_location_id" INTEGER,
    "to_location_id" INTEGER NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PalletMovement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PalletMovement" ADD CONSTRAINT "PalletMovement_pallet_id_fkey" FOREIGN KEY ("pallet_id") REFERENCES "pallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PalletMovement" ADD CONSTRAINT "PalletMovement_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PalletMovement" ADD CONSTRAINT "PalletMovement_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PalletMovement" ADD CONSTRAINT "PalletMovement_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
