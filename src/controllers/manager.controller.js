import prisma from "../config/db.js";

const ALLOWED_ENTITIES = [
  "inboundLot",
  "pallet",
  "productionOrder",
  "location",
  "unit",
];

/**
 * EDIT ENTITY WITH AUDIT
 */
export const editEntity = async (req, res) => {
  const { entity, entity_id, changes, reason } = req.body;

  if (!entity || !entity_id || !changes || !reason) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!ALLOWED_ENTITIES.includes(entity)) {
    return res.status(403).json({ message: "Entity edit not allowed" });
  }

  await prisma.$transaction(async (tx) => {
    await tx.auditLog.create({
      data: {
        entity_name: entity,
        entity_id,
        action: "EDIT",
        reason,
        performed_by: req.user.id,
      },
    });

    await tx[entity].update({
      where: { id: entity_id },
      data: changes,
    });
  });

  res.json({ message: "Entity updated with audit log" });
};

/**
 * MANAGER OVERVIEW
 */
export const managerOverview = async (_, res) => {
  const [
    totalInbound,
    rejectedLots,
    openOrders,
    activePallets,
  ] = await Promise.all([
    prisma.inboundLot.count(),
    prisma.inboundLot.count({ where: { qc_status: "REJECTED" } }),
    prisma.productionOrder.count({ where: { status: "OPEN" } }),
    prisma.pallet.count({ where: { status: "ACTIVE" } }),
  ]);

  res.json({
    totalInbound,
    rejectedLots,
    openOrders,
    activePallets,
  });
};
