import prisma from "../config/db.js";

export const createPallet = async (req, res) => {
    const pallet = await prisma.pallet.create({
        data: {
            ...req.body,
            //pallet_code      String       @unique
            //inbound_lot_id   String
            //current_quantity Float
            //unit_id          Int
            status: "ACTIVE",
        },
    });
    res.status(201).json(pallet);
};

export const movePallet = async (req, res) => {
    const movement = await prisma.palletMovement.create({
        data: {
            ...req.body,
            //   pallet_id        String
            //   from_location_id String?
            //   to_location_id   String
            //   moved_quantity   Float
            moved_by: req.user.id,
        },
    });

    res.json(movement);
};

export const listPallets = async (req, res) => {
    const pallets = await prisma.pallet.findMany({
        include: {
            inboundLot: true,
            location: true,
        },
    });

    res.json(pallets);
};
