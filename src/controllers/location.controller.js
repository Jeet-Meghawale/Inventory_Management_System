import prisma from "../config/db.js";

export const createLocation = async (req, res) => {
    const location = await prisma.location.create({
        data: req.body,

        //location_type LocationType
        //rack_code     String?
        //shelf_code    String?

    });
    res.status(201).json(location);
};

export const listLocations = async (_, res) => {
    const locations = await prisma.location.findMany();
    res.json(locations);
};
