import prisma from "../config/db.js";

/**
 * CREATE PALLET
 */
export const createPallet = async (req, res) => {
    const {
        pallet_code,
        inbound_lot_id,
        current_quantity,
        unit_id,
    } = req.body;

    if (!pallet_code || !inbound_lot_id || !current_quantity || !unit_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const lot = await prisma.inboundLot.findUnique({
        where: { id: inbound_lot_id },
    });

    if (!lot) {
        return res.status(404).json({ message: "Inbound lot not found" });
    }

    // 🔒 only QC accepted material can be palletized
    if (lot.qc_status !== "ACCEPTED") {
        return res.status(400).json({
            message: "Cannot create pallet for non-accepted lot",
        });
    }

    // 🔒 single batch per pallet is naturally enforced by inbound_lot_id
    const pallet = await prisma.pallet.create({
        data: {
            pallet_code,
            inbound_lot_id,
            current_quantity,
            unit_id,
            status: "ACTIVE",
        },
    });

    res.status(201).json(pallet);
};

/**
 * MOVE PALLET
 */
export const movePallet = async (req, res) => {
    const {
        pallet_id,
        from_location_id,
        to_location_id,
        moved_quantity,
    } = req.body;

    if (!pallet_id || !to_location_id || !moved_quantity) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const pallet = await prisma.pallet.findUnique({
        where: { id: pallet_id },
    });

    if (!pallet) {
        return res.status(404).json({ message: "Pallet not found" });
    }

    await prisma.palletMovement.create({
        data: {
            pallet_id,
            from_location_id,
            to_location_id,
            moved_quantity,
            moved_by: req.user.id,
        },
    });

    res.json({ message: "Pallet moved successfully" });
};

/**
 * LIST PALLETS
 */
export const listPallets = async (req, res) => {
    const pallets = await prisma.pallet.findMany({
        include: {
            inboundLot: true,
            location: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });

    res.json(pallets);
};
