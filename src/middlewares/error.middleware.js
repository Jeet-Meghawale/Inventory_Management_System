const errorHandler = (err, req, res, next) => {
    console.error("❌ ERROR:", err);

    // Prisma errors
    if (err.code === "P2002") {
        return res.status(400).json({
            message: "Duplicate entry detected",
        });
    }

    // Custom errors
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }

    // Fallback
    return res.status(500).json({
        message: "Internal server error",
    });
};

export default errorHandler;
