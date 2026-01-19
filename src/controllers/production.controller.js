import prisma from "../config/db.js";

export const createOrder = async (req, res) => {
    const order = await prisma.productionOrder.create({
        data: {
            ...req.body,
            /*  material_name     String
                required_quantity Float
                issued_quantity   Float       @default(0)
                unit_id           Int*/
            requested_by: req.user.id,
            status: "OPEN",
        },
    });

    res.status(201).json(order);
};

export const listOrders = async (req, res) => {
  const orders = await prisma.productionOrder.findMany({
    orderBy: { created_at: "desc" },
  });

  res.json(orders);
};
