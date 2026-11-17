import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const uri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lokart";

async function seedAdmin() {
  try {
    console.log("Connecting to MongoDB to seed admin...");
    await mongoose.connect(uri);
    console.log("MongoDB connected.");

    const email = (process.env.ADMIN_EMAIL || "admin@lokart.com").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "AdminSecurePass123!";
    const name = process.env.ADMIN_NAME || "LokArt Administrator";
    const phone = process.env.ADMIN_PHONE || "9800000000";

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin account already exists for ${email}. (Role: ${existingAdmin.role})`);
      process.exit(0);
    }

    const adminUser = new User({
      name,
      email,
      phone,
      password,
      role: "admin",
      address: {
        country: "Nepal",
        province: "Madhesh Province",
        district: "Parsa",
        municipality: "Birgunj Metropolitan City",
        ward: "10",
        street: "LokArt Central Office, Main Road",
        landmark: "Ghanta Ghar",
      },
    });

    await adminUser.save();
    console.log(`Successfully created protected Admin account: ${email}`);
    console.log("Admin account setup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Admin seed error:", error);
    process.exit(1);
  }
}

seedAdmin();
