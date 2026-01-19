/*
  Warnings:

  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpiryAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InboundLot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaterialIssue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pallet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PalletMovement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductionOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QCInspection` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_performed_by_fkey";

-- DropForeignKey
ALTER TABLE "ExpiryAlert" DROP CONSTRAINT "ExpiryAlert_inbound_lot_id_fkey";

-- DropForeignKey
ALTER TABLE "InboundLot" DROP CONSTRAINT "InboundLot_created_by_fkey";

-- DropForeignKey
ALTER TABLE "InboundLot" DROP CONSTRAINT "InboundLot_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "MaterialIssue" DROP CONSTRAINT "MaterialIssue_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "MaterialIssue" DROP CONSTRAINT "MaterialIssue_pallet_id_fkey";

-- DropForeignKey
ALTER TABLE "MaterialIssue" DROP CONSTRAINT "MaterialIssue_production_order_id_fkey";

-- DropForeignKey
ALTER TABLE "Pallet" DROP CONSTRAINT "Pallet_inbound_lot_id_fkey";

-- DropForeignKey
ALTER TABLE "Pallet" DROP CONSTRAINT "Pallet_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "PalletMovement" DROP CONSTRAINT "PalletMovement_from_location_id_fkey";

-- DropForeignKey
ALTER TABLE "PalletMovement" DROP CONSTRAINT "PalletMovement_moved_by_fkey";

-- DropForeignKey
ALTER TABLE "PalletMovement" DROP CONSTRAINT "PalletMovement_pallet_id_fkey";

-- DropForeignKey
ALTER TABLE "PalletMovement" DROP CONSTRAINT "PalletMovement_to_location_id_fkey";

-- DropForeignKey
ALTER TABLE "ProductionOrder" DROP CONSTRAINT "ProductionOrder_requested_by_fkey";

-- DropForeignKey
ALTER TABLE "ProductionOrder" DROP CONSTRAINT "ProductionOrder_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "QCInspection" DROP CONSTRAINT "QCInspection_inbound_lot_id_fkey";

-- DropForeignKey
ALTER TABLE "QCInspection" DROP CONSTRAINT "QCInspection_inspected_by_fkey";

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "ExpiryAlert";

-- DropTable
DROP TABLE "InboundLot";

-- DropTable
DROP TABLE "Location";

-- DropTable
DROP TABLE "MaterialIssue";

-- DropTable
DROP TABLE "Pallet";

-- DropTable
DROP TABLE "PalletMovement";

-- DropTable
DROP TABLE "ProductionOrder";

-- DropTable
DROP TABLE "QCInspection";

-- CreateTable
CREATE TABLE "inboundlot" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "batch_no" TEXT,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "total_quantity" DOUBLE PRECISION NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "qc_status" "QCStatus" NOT NULL DEFAULT 'HOLD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "inboundlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qcinpection" (
    "id" TEXT NOT NULL,
    "inbound_lot_id" TEXT NOT NULL,
    "result" "QCStatus" NOT NULL,
    "remarks" TEXT,
    "inspected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspected_by" TEXT NOT NULL,

    CONSTRAINT "qcinpection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pallet" (
    "id" TEXT NOT NULL,
    "pallet_code" TEXT NOT NULL,
    "inbound_lot_id" TEXT NOT NULL,
    "current_quantity" DOUBLE PRECISION NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "status" "PalletStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "pallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "location_type" "LocationType" NOT NULL,
    "rack_code" TEXT,
    "shelf_code" TEXT,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palletmovement" (
    "id" TEXT NOT NULL,
    "pallet_id" TEXT NOT NULL,
    "from_location_id" TEXT,
    "to_location_id" TEXT NOT NULL,
    "moved_quantity" DOUBLE PRECISION NOT NULL,
    "moved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moved_by" TEXT NOT NULL,

    CONSTRAINT "palletmovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productionorder" (
    "id" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "required_quantity" DOUBLE PRECISION NOT NULL,
    "issued_quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit_id" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requested_by" TEXT NOT NULL,

    CONSTRAINT "productionorder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materialissue" (
    "id" TEXT NOT NULL,
    "production_order_id" TEXT NOT NULL,
    "pallet_id" TEXT NOT NULL,
    "issued_quantity" DOUBLE PRECISION NOT NULL,
    "override_used" BOOLEAN NOT NULL DEFAULT false,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by" TEXT,

    CONSTRAINT "materialissue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expiryalert" (
    "id" TEXT NOT NULL,
    "inbound_lot_id" TEXT NOT NULL,
    "alert_date" TIMESTAMP(3) NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "expiryalert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditlog" (
    "id" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "reason" TEXT NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performed_by" TEXT NOT NULL,

    CONSTRAINT "auditlog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qcinpection_inbound_lot_id_key" ON "qcinpection"("inbound_lot_id");

-- CreateIndex
CREATE UNIQUE INDEX "pallet_pallet_code_key" ON "pallet"("pallet_code");

-- AddForeignKey
ALTER TABLE "inboundlot" ADD CONSTRAINT "inboundlot_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inboundlot" ADD CONSTRAINT "inboundlot_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qcinpection" ADD CONSTRAINT "qcinpection_inspected_by_fkey" FOREIGN KEY ("inspected_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qcinpection" ADD CONSTRAINT "qcinpection_inbound_lot_id_fkey" FOREIGN KEY ("inbound_lot_id") REFERENCES "inboundlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pallet" ADD CONSTRAINT "pallet_inbound_lot_id_fkey" FOREIGN KEY ("inbound_lot_id") REFERENCES "inboundlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pallet" ADD CONSTRAINT "pallet_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palletmovement" ADD CONSTRAINT "palletmovement_moved_by_fkey" FOREIGN KEY ("moved_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palletmovement" ADD CONSTRAINT "palletmovement_pallet_id_fkey" FOREIGN KEY ("pallet_id") REFERENCES "pallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palletmovement" ADD CONSTRAINT "palletmovement_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palletmovement" ADD CONSTRAINT "palletmovement_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productionorder" ADD CONSTRAINT "productionorder_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productionorder" ADD CONSTRAINT "productionorder_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materialissue" ADD CONSTRAINT "materialissue_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materialissue" ADD CONSTRAINT "materialissue_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "productionorder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materialissue" ADD CONSTRAINT "materialissue_pallet_id_fkey" FOREIGN KEY ("pallet_id") REFERENCES "pallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expiryalert" ADD CONSTRAINT "expiryalert_inbound_lot_id_fkey" FOREIGN KEY ("inbound_lot_id") REFERENCES "inboundlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditlog" ADD CONSTRAINT "auditlog_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
