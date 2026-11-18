import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import connectDB, { getDatabaseState } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import vendorProductRoutes from "./routes/vendorProductRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import commissionRoutes from "./routes/commissionRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import artisanRoutes from "./routes/artisanRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import { getCategories } from "./controllers/productController.js";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv.config({ path: '/custom/path/to/.env' })
dotenv.config({
  path: './.env'
})
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

// Dynamic CORS configuration for Render and local development
const configuredOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);

      // Check configured origins
      if (configuredOrigins.includes(origin)) return callback(null, true);

      // Allow any Render deployment origin (*.onrender.com) or localhost
      if (
        origin.endsWith(".onrender.com") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }

      // Permissive fallback so production requests are never blocked
      return callback(null, true);
    },
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
app.use("/api/ai", aiRoutes);
app.use("/api/artisans", artisanRoutes);
app.use("/api/stories", storyRoutes);

// Serve Frontend client build in production (supports single-service Render deployment)
const clientDistPath = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  // SPA fallback for client-side routing in Express 5
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Global error handler
app.use((error, _request, response, _next) => {
  console.error("Unhandled error:", error);
  response.status(500).json({ ok: false, message: "Something went wrong." });
});

app.listen(port, () => {
  console.log(`LokArt API listening on http://localhost:${port}`);
});

connectDB();
