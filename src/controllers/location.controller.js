import prisma from "../config/db.js";

/**
 * CREATE LOCATION
 */
export const createLocation = async (req, res) => {
  const { location_type, rack_code, shelf_code } = req.body;

  if (!location_type) {
    return res.status(400).json({ message: "location_type is required" });
  }

  if (!["RACK", "GROUND"].includes(location_type)) {
    return res.status(400).json({ message: "Invalid location type" });
  }

  if (location_type === "RACK" && !rack_code) {
    return res.status(400).json({
      message: "rack_code is required for RACK location",
    });
  }

  const location = await prisma.location.create({
    data: {
      location_type,
      rack_code,
      shelf_code,
    },
  });

  res.status(201).json(location);
};

/**
 * LIST LOCATIONS
 */
export const listLocations = async (_, res) => {
  const locations = await prisma.location.findMany({
    orderBy: { created_at: "asc" },
  });

  res.json(locations);
};
