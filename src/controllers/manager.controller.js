import prisma from "../config/db.js";

export const editEntity = async (req, res) => {
    const { entity, entity_id, changes, reason } = req.body;

    await prisma.auditLog.create({
        data: {
            entity_name: entity,
            entity_id,
            action: "EDIT",
            reason,
            performed_by: req.user.id,
        },
    });

    await prisma[entity].update({
        where: { id: entity_id },
        data: changes,
    });

    res.json({ message: "Entity updated with audit log" });
};

export const managerOverview = async (req, res) => {
    const [
        totalInbound,
        rejectedLots,
        openOrders,
        pallets,
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
        activePallets: pallets,
    });
};
