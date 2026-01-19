import prisma from "../config/db.js";

/**
 * CREATE UNIT
 */
export const createUnit = async (req, res) => {
  const { unit_name } = req.body;

  if (!unit_name) {
    return res.status(400).json({ message: "unit_name is required" });
  }

  const exists = await prisma.unit.findFirst({
    where: { unit_name },
  });

  if (exists) {
    return res.status(400).json({ message: "Unit already exists" });
  }

  const unit = await prisma.unit.create({
    data: {
      unit_name,
      created_by: req.user.id,
    },
  });

  res.status(201).json(unit);
};

/**
 * LIST UNITS
 */
export const listUnits = async (_, res) => {
  const units = await prisma.unit.findMany({
    where: { is_active: true },
    orderBy: { created_at: "asc" },
  });

  res.json(units);
};
