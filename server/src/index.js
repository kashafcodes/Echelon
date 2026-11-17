import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDatabase, getDatabaseState } from "./db.js";

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
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "lokart-api",
    database: getDatabaseState(),
  });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ ok: false, message: "Something went wrong." });
});

app.listen(port, () => {
  console.log(`LokArt API listening on http://localhost:${port}`);
});

connectDatabase();
