import prisma from "../config/db.js";

export const inspect = async (req, res) => {
    const { inbound_lot_id, result, remarks } = req.body;

    await prisma.qCInspection.create({
        data: {
            inbound_lot_id,
            result,  // QCStatus
            remarks,
            inspected_by: req.user.id,
        },
    });

    await prisma.inboundLot.update({
        where: { id: inbound_lot_id },
        data: {
            qc_status: result === "ACCEPT" ? "ACCEPTED" : "REJECTED",
        },
    });

    res.json({ message: "QC completed" });
};

export const listPendingQC = async (req, res) => {
  const lots = await prisma.inboundLot.findMany({
    where: { qc_status: "HOLD" },
    orderBy: { created_at: "asc" },
  });

  res.json(lots);
};