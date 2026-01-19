import prisma from "../config/db.js";

/**
 * QC INSPECTION
 */
export const inspect = async (req, res) => {
  const { inbound_lot_id, result, remarks } = req.body;

  if (!inbound_lot_id || !result) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!["ACCEPT", "REJECT"].includes(result)) {
    return res.status(400).json({ message: "Invalid QC result" });
  }

  const lot = await prisma.inboundLot.findUnique({
    where: { id: inbound_lot_id },
  });

  if (!lot) {
    return res.status(404).json({ message: "Inbound lot not found" });
  }

  // 🔒 prevent re-inspection
  if (lot.qc_status !== "HOLD") {
    return res.status(400).json({
      message: "QC already completed for this lot",
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.qCInspection.create({
      data: {
        inbound_lot_id,
        result,
        remarks,
        inspected_by: req.user.id,
      },
    });

    await tx.inboundLot.update({
      where: { id: inbound_lot_id },
      data: {
        qc_status: result === "ACCEPT" ? "ACCEPTED" : "REJECTED",
      },
    });
  });

  res.json({ message: "QC completed successfully" });
};

/**
 * LIST PENDING QC LOTS
 */
export const listPendingQC = async (req, res) => {
  const lots = await prisma.inboundLot.findMany({
    where: { qc_status: "HOLD" },
    orderBy: { created_at: "asc" },
  });

  res.json(lots);
};
