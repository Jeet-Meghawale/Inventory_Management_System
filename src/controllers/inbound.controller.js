import prisma from "../config/db.js";

export const createInbound = async (req, res) => {
    const {
        company_name,
        material_name,
        batch_no,
        expiry_date,
        total_quantity,
        unit_id,
    } = req.body;

    if (!company_name || !material_name || !total_quantity || !unit_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    const exists = await prisma.inboundLot.findFirst({
        where: {
            company_name,
            material_name,
            batch_no,
        },
    });

    if (exists) {
        return res.status(400).json({ message: "Batch already exists" });
    }

    const inbound = await prisma.inboundLot.create({
        data: {
            ...req.body,
            qc_status: "HOLD",
            created_by: req.user.id,
        },
    });
    res.status(201).json(inbound);
};

export const listInbound = async (req, res) => {
    const { status } = req.query;

    const lots = await prisma.inboundLot.findMany({
        where: status ? { qc_status: status } : {},
        orderBy: {
            created_at: "desc", 
        },
    });

    res.json(lots);
};
