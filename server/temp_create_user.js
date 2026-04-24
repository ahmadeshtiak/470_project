import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import User from "./src/models/User.js";
import { hashPassword } from "./src/utils/auth.js";

const __dirname = path.resolve();
const envPath = path.join(__dirname, ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const mongoUri = envContent.match(/MONGO_URI=(.+)/)?.[1];

if (!mongoUri) {
    console.error('MONGO_URI not found');
    process.exit(1);
}

const run = async () => {
    await mongoose.connect(mongoUri);
    const existing = await User.findOne({ email: 'debug@example.com' });
    if (existing) {
        console.log('User already exists');
        process.exit(0);
    }
    const user = new User({
        name: 'Debug User',
        email: 'debug@example.com',
        phone: '0123456789',
        address: 'Debug Address',
        about: 'Debug user',
        password: await hashPassword('password123'),
        role: 'buyer'
    });
    await user.save();
    console.log('Created debug user');
    process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
