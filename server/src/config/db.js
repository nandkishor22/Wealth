import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB Disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB Reconnected");
    });

  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
