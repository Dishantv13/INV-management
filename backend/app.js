import express from "express";
import cors from "cors";
import { globalErrorHandler } from "./utils/globelErrorHandler.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import itemRoutes from "./routes/item.route.js";
import stockRoutes from "./routes/stock.route.js";
import locationRoutes from "./routes/location.route.js";

app.use("/api/items", itemRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/locations", locationRoutes);

app.use(globalErrorHandler);

export default app;
