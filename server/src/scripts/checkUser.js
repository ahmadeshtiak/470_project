import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import User from '../models/User.js';

const email = process.argv[2] || 'carol@example.com';
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/autoforge';

(async () => {
  try {
    await mongoose.connect(MONGO);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email }).select('-password');
    if (user) {
      console.log('\n✅ User found:');
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  Phone:', user.phone);
    } else {
      console.log('\n❌ User not found with email:', email);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
