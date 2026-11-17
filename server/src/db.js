import mongoose from "mongoose";

let databaseState = "disconnected";

export function getDatabaseState() {
  return databaseState;
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lokart";
  try {
    await mongoose.connect(uri);
    databaseState = "connected";
    const sanitized = uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
    console.log(`MongoDB connected: ${sanitized}`);
  } catch (error) {
    databaseState = "error";
    console.error("MongoDB connection failed:", error.message);
  }
};

export default connectDB;
