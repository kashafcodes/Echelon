import mongoose from "mongoose";

let databaseState = "not_configured";

export function getDatabaseState() {
  return databaseState;
}

/**
 * Connects when MONGODB_URI is set. A missing URI is expected during early
 * setup: the API keeps running so the homepage does not depend on Atlas.
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    databaseState = "not_configured";
    console.log("MongoDB: not configured. Add MONGODB_URI to server/.env when Atlas is ready.");
    return;
  }

  try {
    await mongoose.connect(uri);
    databaseState = "connected";
    console.log("MongoDB: connected.");
  } catch (error) {
    databaseState = "error";
    console.error("MongoDB: connection failed.", error.message);
  }
}
