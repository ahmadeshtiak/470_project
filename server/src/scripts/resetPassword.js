import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');

// Parse .env manually
const envContent = fs.readFileSync(envPath, 'utf8');
const mongoUri = envContent.match(/MONGO_URI=(.+)/)?.[1];

if (!mongoUri) {
  console.error('MONGO_URI not found in .env');
  process.exit(1);
}

import User from '../models/User.js';

const newPassword = process.argv[2] || 'admin123';

(async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update Carol's password
    const result = await User.findOneAndUpdate(
      { email: 'carol@example.com' },
      { password: hashedPassword },
      { new: true }
    ).select('-password');

    console.log('\n✅ Reset Carol Admin password:');
    console.log(`Email: ${result.email}`);
    console.log(`Password: ${newPassword}`);
    console.log(`Role: ${result.role}`);
    console.log('\nYou can now login with these credentials!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
