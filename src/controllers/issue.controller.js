import prisma from "../config/db.js";

/**
 * MANUAL ISSUE (WITH OVERRIDE CONTROL)
 */
export const issueMaterial = async (req, res) => {
  const {
    production_order_id,
    pallet_id,
    issued_quantity,
    override_used = false,
    approved_by,
  } = req.body;

  if (!production_order_id || !pallet_id || !issued_quantity) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const order = await prisma.productionOrder.findUnique({
    where: { id: production_order_id },
  });

  if (!order || order.status === "COMPLETED") {
    return res.status(400).json({ message: "Invalid or completed order" });
  }

  const remainingOrderQty =
    order.required_quantity - order.issued_quantity;

  if (issued_quantity > remainingOrderQty) {
    return res.status(400).json({
      message: "Issued quantity exceeds remaining order requirement",
    });
  }

  const pallet = await prisma.pallet.findUnique({
    where: { id: pallet_id },
    include: { inboundLot: true },
  });

  if (!pallet) {
    return res.status(404).json({ message: "Pallet not found" });
  }

  if (pallet.inboundLot.qc_status !== "ACCEPTED") {
    return res.status(400).json({ message: "Material not QC accepted" });
  }

  if (pallet.current_quantity < issued_quantity) {
    return res.status(400).json({ message: "Insufficient pallet quantity" });
  }

  if (override_used && !approved_by) {
    return res.status(403).json({
      message: "Manager approval required for FIFO override",
    });
  }

  const issue = await prisma.$transaction(async (tx) => {
    const createdIssue = await tx.materialIssue.create({
      data: {
        production_order_id,
        pallet_id,
        issued_quantity,
        override_used,
        approved_by,
      },
    });

    await tx.pallet.update({
      where: { id: pallet_id },
      data: {
        current_quantity: { decrement: issued_quantity },
        status:
          pallet.current_quantity - issued_quantity === 0
            ? "EMPTY"
            : "ACTIVE",
      },
    });

    const updatedOrder = await tx.productionOrder.update({
      where: { id: production_order_id },
      data: {
        issued_quantity: { increment: issued_quantity },
      },
    });

    if (override_used) {
      await tx.auditLog.create({
        data: {
          entity_name: "MaterialIssue",
          entity_id: createdIssue.id,
          action: "OVERRIDE",
          reason: "FIFO broken with manager approval",
          performed_by: approved_by,
        },
      });
    }

    return { createdIssue, updatedOrder };
  });

  res.status(201).json(issue.createdIssue);
};

/**
 * AUTO ISSUE (FIFE – SYSTEM DECIDES)
 */
export const autoIssueMaterial = async (req, res) => {
  const { production_order_id } = req.body;

  if (!production_order_id) {
    return res.status(400).json({ message: "Production order id required" });
  }

  const order = await prisma.productionOrder.findUnique({
    where: { id: production_order_id },
  });

  if (!order || order.status === "COMPLETED") {
    return res.status(400).json({ message: "Invalid or completed order" });
  }

  let remainingQty =
    order.required_quantity - order.issued_quantity;

  if (remainingQty <= 0) {
    return res.status(400).json({ message: "Order already fulfilled" });
  }

  const issues = [];

  await prisma.$transaction(async (tx) => {
    const pallets = await tx.pallet.findMany({
      where: {
        status: "ACTIVE",
        current_quantity: { gt: 0 },
        inboundLot: {
          material_name: order.material_name,
          qc_status: "ACCEPTED",
        },
      },
      include: { inboundLot: true },
      orderBy: {
        inboundLot: { expiry_date: "asc" },
      },
    });

    for (const pallet of pallets) {
      if (remainingQty <= 0) break;

      const issueQty = Math.min(pallet.current_quantity, remainingQty);

      const issue = await tx.materialIssue.create({
        data: {
          production_order_id,
          pallet_id: pallet.id,
          issued_quantity: issueQty,
          override_used: false,
        },
      });

      await tx.pallet.update({
        where: { id: pallet.id },
        data: {
          current_quantity: { decrement: issueQty },
          status:
            pallet.current_quantity - issueQty === 0
              ? "EMPTY"
              : "ACTIVE",
        },
      });

      remainingQty -= issueQty;
      issues.push(issue);
    }

    await tx.productionOrder.update({
      where: { id: production_order_id },
      data: {
        issued_quantity:
          order.required_quantity - remainingQty,
        status: remainingQty === 0 ? "COMPLETED" : "PARTIAL",
      },
    });
  });

  res.json({
    message:
      remainingQty === 0
        ? "Material issued fully using FIFE"
        : "Partial issue – insufficient stock",
    issued_quantity:
      order.required_quantity - remainingQty,
    remaining_required: remainingQty,
    issues,
  });
};
