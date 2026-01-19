import "express-async-errors";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import routes from "./routes/index.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

// global middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// health check (optional but recommended)
app.get("/", (req, res) => {
  res.json({ status: "API is running" });
});

// API routes
app.use("/api/v1", routes);

// error handler MUST be last
app.use(errorHandler);

export default app;
