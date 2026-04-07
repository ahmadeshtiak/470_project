import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

import Car from "../models/Car.js";
import User from "../models/User.js";

const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/motorwala";

// Dummy car listings with images (using images array)
const dummyCars = [
  {
    model: "Civic",
    brand: "Honda",
    year: 2020,
    price: 22000,
    condition: "used",
    images: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0ad6?w=800&h=600&fit=crop"],
  },
  {
    model: "Corolla",
    brand: "Toyota",
    year: 2019,
    price: 18500,
    condition: "used",
    images: ["https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop"],
  },
  {
    model: "Model 3 Long Range",
    brand: "Tesla",
    year: 2023,
    price: 48000,
    condition: "new",
    images: ["https://images.unsplash.com/photo-1560958035-577d04f1e7a8?w=800&h=600&fit=crop"],
  },
  {
    model: "Mustang GT",
    brand: "Ford",
    year: 2021,
    price: 52000,
    condition: "used",
    images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop"],
  },
  {
    model: "A4",
    brand: "Audi",
    year: 2022,
    price: 40000,
    condition: "new",
    images: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0ad6?w=800&h=600&fit=crop"],
  },
  {
    model: "3 Series 320i",
    brand: "BMW",
    year: 2020,
    price: 35000,
    condition: "used",
    images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop"],
  },
  {
    model: "Elantra",
    brand: "Hyundai",
    year: 2018,
    price: 15000,
    condition: "used",
    images: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0ad6?w=800&h=600&fit=crop"],
  },
  {
    model: "Sportage",
    brand: "Kia",
    year: 2021,
    price: 28000,
    condition: "new",
    images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop"],
  },
];

(async () => {
  try {
    await mongoose.connect(MONGO);
    console.log("✅ Connected to MongoDB");

    // Get seller ID from command line argument or use default
    const sellerIdArg = process.argv[2];
    let sellerId;

    if (sellerIdArg) {
      sellerId = sellerIdArg;
    } else {
      // Try to find a seller user, or use the default ObjectId
      const seller = await User.findOne({ role: "seller" });
      if (seller) {
        sellerId = seller._id.toString();
        console.log(`📌 Using existing seller: ${seller.name} (${seller.email})`);
      } else {
        sellerId = "677f2eba4f4b5c783e08bd55"; // Default placeholder
        console.log("⚠️  No seller found. Using placeholder ObjectId. Please update manually.");
      }
    }

    // Check if seller exists
    const sellerExists = await User.findById(sellerId);
    if (!sellerExists) {
      console.log(
        `⚠️  Seller with ID ${sellerId} not found. Cars will be created with this ID anyway.`
      );
      console.log("   You can update the seller field later or create a seller user first.");
    }

    // Clear existing cars (optional - comment out if you want to keep existing data)
    // await Car.deleteMany({});
    // console.log("🗑️  Cleared existing cars");

    // Insert dummy cars
    const carsToInsert = dummyCars.map((car) => ({
      ...car,
      seller: sellerId,
    }));

    const insertedCars = await Car.insertMany(carsToInsert);

    console.log(`\n✅ Successfully inserted ${insertedCars.length} car listings`);
    console.log("\n📋 Inserted cars:");
    insertedCars.forEach((car) => {
      console.log(`   - ${car.brand} ${car.model} (${car.year}) - $${car.price}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();

