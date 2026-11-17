// import mongoose from "mongoose";

// let databaseState = "not_configured";

// export function getDatabaseState() {
//   return databaseState;
// }


// export async function connectDatabase() {
//   const uri = process.env.MONGODB_URI;

//   if (!uri) {
//     databaseState = "not_configured";
//     console.log("MongoDB: not configured. Add MONGODB_URI to server/.env when Atlas is ready.");
//     return;
//   }

//   try {
//     await mongoose.connect(uri);
//     databaseState = "connected";
//     console.log("MongoDB: connected.");
//   } catch (error) {
//     databaseState = "error";
//     console.error("MongoDB: connection failed.", error.message);
//   }
// }


import mongoose from 'mongoose'


const connectDB = async () => {
  try {
    // await mongoose.connect('mongodb+srv://power1ful88_db_user:cRE60pJ49MsS54xy@cluster0.tszr5ky.mongodb.net/')
    await mongoose.connect('mongodb://127.0.0.1:27017/test');
    onsole.log('Database connected');
  } catch (error) {
    console.log(error.message);
  }
}

export default connectDB