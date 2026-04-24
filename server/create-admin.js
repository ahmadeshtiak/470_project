import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import { hashPassword } from "./src/utils/auth.js";

dotenv.config();

const createAdmin = async () => {
  try {
    // 1. Connect to MongoDB
    if (!process.env.MONGO_URI) {
      console.error("❌ Error: MONGO_URI is not set in .env file");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB...");

    // 2. Prepare user details
    const adminDetails = {
      name: "Shanto Admin",
      email: "shanto@example.com",
      password: "shanto1234", // This will be hashed
      phone: "01700000000",
      address: "Dhaka, Bangladesh",
      about: "Platform Administrator",
      role: "admin",
      isEmailVerified: true
    };

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email: adminDetails.email });
    if (existingUser) {
      console.log("⚠️  User already exists. Updating to Admin...");
      existingUser.role = "admin";
      existingUser.isEmailVerified = true;
      await existingUser.save();
      console.log("✅ User updated to Admin successfully!");
    } else {
      // 4. Hash password and create user
      const hashedPassword = await hashPassword(adminDetails.password);
      const newUser = new User({
        ...adminDetails,
        password: hashedPassword
      });
      await newUser.save();
      console.log("✅ Admin user created successfully!");
    }

    console.log("\n-----------------------------------");
    console.log(`Login Email: ${adminDetails.email}`);
    console.log(`Login Password: ${adminDetails.password}`);
    console.log("-----------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
