import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

// Fix for Node.js "querySrv ECONNREFUSED" on Windows
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  // Ignore if custom DNS setting is not permitted in environment
}

let databaseState = "disconnected";

export function getDatabaseState() {
  return databaseState;
}

const connectDB = async () => {
  let uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lokart";

  // Ensure database name exists in Atlas URI
  if (uri.startsWith("mongodb+srv://") && uri.endsWith("/")) {
    uri = uri + "lokart?retryWrites=true&w=majority";
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    databaseState = "connected";
    const sanitized = uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
    console.log(`MongoDB connected: ${sanitized}`);
  } catch (error) {
    databaseState = "error";
    console.error("MongoDB connection failed:", error.message);

    // If Atlas failed (e.g. DNS or IP restriction), fallback to local MongoDB if different
    const localUri = "mongodb://127.0.0.1:27017/lokart";
    if (uri !== localUri && !uri.includes("127.0.0.1")) {
      console.log(`Attempting fallback to local MongoDB: ${localUri}...`);
      try {
        await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 4000,
        });
        databaseState = "connected";
        console.log(`MongoDB connected (fallback to local): ${localUri}`);
      } catch (fallbackError) {
        console.error("Local MongoDB fallback also failed:", fallbackError.message);
      }
    }
  }
};

export default connectDB;
