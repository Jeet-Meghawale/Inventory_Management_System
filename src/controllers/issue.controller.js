import prisma from "../config/db.js";

export const issueMaterial = async (req, res) => {
  const {
    production_order_id,
    pallet_id,
    issued_quantity,
    override_used = false,
    approved_by,
  } = req.body;

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

  // Enforce override approval
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

    await tx.productionOrder.update({
      where: { id: production_order_id },
      data: {
        issued_quantity: { increment: issued_quantity },
      },
    });

    // Audit override
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

    return createdIssue;
  });

  res.status(201).json(issue);
};


export const autoIssueMaterial = async (req, res) => {
  const { production_order_id } = req.body;

  const order = await prisma.productionOrder.findUnique({
    where: { id: production_order_id },
    include: { unit: true },
  });

  if (!order) {
    return res.status(404).json({ message: "Production order not found" });
  }

  let remainingQty = order.required_quantity;
  const issues = [];

  const pallets = await prisma.pallet.findMany({
    where: {
      status: "ACTIVE",
      current_quantity: { gt: 0 },
      inboundLot: {
        material_name: order.material_name,
        qc_status: "ACCEPTED",
      },
    },
    include: {
      inboundLot: true,
    },
    orderBy: {
      inboundLot: {
        expiry_date: "asc",
      },
    },
  });

  for (const pallet of pallets) {
    if (remainingQty <= 0) break;

    const issueQty = Math.min(pallet.current_quantity, remainingQty);

    // record issue
    const issue = await prisma.materialIssue.create({
      data: {
        production_order_id,
        pallet_id: pallet.id,
        issued_quantity: issueQty,
        override_used: false,
      },
    });

    // update pallet qty
    await prisma.pallet.update({
      where: { id: pallet.id },
      data: {
        current_quantity: {
          decrement: issueQty,
        },
        status:
          pallet.current_quantity - issueQty === 0 ? "EMPTY" : "ACTIVE",
      },
    });

    remainingQty -= issueQty;
    issues.push(issue);
  }

  await prisma.productionOrder.update({
    where: { id: production_order_id },
    data: {
      issued_quantity: order.required_quantity - remainingQty,
      status: remainingQty === 0 ? "COMPLETED" : "PARTIAL",
    },
  });

  res.json({
    message: "Material issued using FIFE",
    issues,
  });
};
