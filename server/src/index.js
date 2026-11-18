import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import connectDB, { getDatabaseState } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import vendorProductRoutes from "./routes/vendorProductRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import commissionRoutes from "./routes/commissionRoutes.js";
import { getCategories } from "./controllers/productController.js";
import dotenv from "dotenv";

// dotenv.config({ path: '/custom/path/to/.env' })
dotenv.config({
  path: './.env'
})
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Health check endpoint
app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "lokart-api",
    database: getDatabaseState(),
    message: "LokArt API is running smoothly.",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Category & Product routes
app.get("/api/categories", getCategories);
app.use("/api/products", productRoutes);
app.use("/api/vendor/products", vendorProductRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/commission", commissionRoutes);

// Global error handler
app.use((error, _request, response, _next) => {
  console.error("Unhandled error:", error);
  response.status(500).json({ ok: false, message: "Something went wrong." });
});

app.listen(port, () => {
  console.log(`LokArt API listening on http://localhost:${port}`);
});

connectDB();
