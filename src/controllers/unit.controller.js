import prisma from "../config/db.js";

export const createUnit = async (req, res) => {
    const unit = await prisma.unit.create({
        data: {
            unit_name: req.body.unit_name,
            created_by: req.user.id,
        },
    });
    res.status(201).json(unit);
};

export const listUnits = async (_, res) => {
    const units = await prisma.unit.findMany({
        where: { is_active: true },
    });
    res.json(units);
};
