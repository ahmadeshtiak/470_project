import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

(async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Update carol@example.com to have name "Carol Admin"
    const result = await User.findOneAndUpdate(
      { email: 'carol@example.com' },
      { name: 'Carol Admin' },
      { new: true }
    ).select('-password');

    console.log('\n✅ Updated Carol Admin:');
    console.log(`Name: ${result.name}`);
    console.log(`Email: ${result.email}`);
    console.log(`Role: ${result.role}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
