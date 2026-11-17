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

// In-memory store for artisan registrations when DB is in setup
const inMemoryArtisans = [];

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "lokart-api",
    database: getDatabaseState(),
    uptime: process.uptime(),
  });
});

app.get("/api/artisans", (_request, response) => {
  response.json({
    ok: true,
    total: inMemoryArtisans.length,
    data: inMemoryArtisans,
  });
});

app.post("/api/artisans", (request, response) => {
  try {
    const {
      fullName,
      phone,
      district,
      municipality,
      craft,
      experience,
      supportPreference,
      story,
      sampleCraft,
      isHelper,
      consent,
    } = request.body;

    if (!fullName || !phone || !craft) {
      return response.status(400).json({
        ok: false,
        message: "Full name, phone number, and craft category are required.",
      });
    }

    const newArtisan = {
      id: `LOK-${Date.now().toString(36).toUpperCase()}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      district: district ? district.trim() : "Parsa",
      municipality: municipality ? municipality.trim() : "",
      craft,
      experience: experience || "1-3 years",
      supportPreference: supportPreference || "self",
      story: story ? story.trim() : "",
      sampleCraft: sampleCraft || {},
      isHelper: Boolean(isHelper),
      consent: Boolean(consent),
      status: "pending_verification",
      registeredAt: new Date().toISOString(),
    };

    inMemoryArtisans.unshift(newArtisan);

    return response.status(201).json({
      ok: true,
      message: "Artisan registration received successfully. Our Parsa coordinator will connect soon.",
      artisan: newArtisan,
    });
  } catch (error) {
    console.error("Artisan registration error:", error);
    return response.status(500).json({
      ok: false,
      message: "Failed to process artisan registration.",
    });
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ ok: false, message: "Something went wrong." });
});

app.listen(port, () => {
  console.log(`LokArt API listening on http://localhost:${port}`);
});

connectDatabase();
