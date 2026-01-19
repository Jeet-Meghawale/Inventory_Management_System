import prisma from "../config/db.js";

/**
 * CREATE PRODUCTION ORDER
 */
export const createOrder = async (req, res) => {
  const { material_name, required_quantity, unit_id } = req.body;

  if (!material_name || !required_quantity || !unit_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (required_quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be greater than zero" });
  }

  const order = await prisma.productionOrder.create({
    data: {
      material_name,
      required_quantity,
      unit_id,
      requested_by: req.user.id,
      status: "OPEN",
    },
  });

  res.status(201).json(order);
};

/**
 * LIST PRODUCTION ORDERS
 */
export const listOrders = async (req, res) => {
  const orders = await prisma.productionOrder.findMany({
    orderBy: { created_at: "desc" },
  });

  res.json(orders);
};
