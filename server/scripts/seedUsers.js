import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../model/user.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Please set MONGO_URI in your environment or .env file");
  process.exit(1);
}

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Remove existing test users with these emails (idempotent)
    const emails = [
      "alice@example.com",
      "bob@example.com",
      "carol@example.com"
    ];

    await User.deleteMany({ email: { $in: emails } });

    const users = [
      {
        firstName: "Alice",
        lastName: "Buyer",
        email: "alice@example.com",
        password: "password123",
        role: "buyer",
      },
      {
        firstName: "Bob",
        lastName: "Seller",
        email: "bob@example.com",
        password: "password123",
        role: "seller",
      },
      {
        firstName: "Carol",
        lastName: "Admin",
        email: "carol@example.com",
        password: "password123",
        role: "admin",
      },
    ];

    const created = await User.insertMany(users);
    console.log("Seeded users:");
    created.forEach(u => console.log(`- ${u.email} (${u.role}) id=${u._id}`));

    await mongoose.disconnect();
    console.log("Disconnected. Seeding finished.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedUsers();
