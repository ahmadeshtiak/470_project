# Car Listing CRUD System - Setup Guide

## ✅ Implementation Complete

All backend and frontend components have been implemented with role-based access control.

## 🗄️ Database Seeder

To populate the database with dummy car listings, run:

```bash
cd server
node src/scripts/seedCars.js [sellerId]
```

**Options:**
- Without arguments: Uses the first seller user found in the database, or falls back to placeholder ObjectId
- With sellerId: Uses the specified seller ObjectId (e.g., `node src/scripts/seedCars.js 677f2eba4f4b5c783e08bd55`)

**Note:** The seeder will insert 8 dummy car listings. If you want to clear existing cars first, uncomment the `Car.deleteMany({})` line in the seeder script.

## 🚀 Running the Project

### Backend Server
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`

### Frontend Client
```bash
cd client
npm start
```
Client runs on `http://localhost:3000`

## 📋 Features Implemented

### Backend
- ✅ Car model with all required fields
- ✅ Auth middleware (extracts userId and role from JWT)
- ✅ Role middleware (allowRoles)
- ✅ CRUD routes with role-based access:
  - `GET /api/cars` - Everyone can view
  - `GET /api/cars/:id` - Everyone can view
  - `POST /api/cars` - Admin and Seller only
  - `PUT /api/cars/:id` - Admin can edit any, Seller can edit only their own
  - `DELETE /api/cars/:id` - Admin can delete any, Seller can delete only their own

### Frontend
- ✅ Axios instance with baseURL and withCredentials
- ✅ CarList.jsx - Displays all cars with conditional Edit/Delete buttons
- ✅ AddCar.jsx - Form to add new car listings (Admin/Seller only)
- ✅ EditCar.jsx - Form to edit car listings (with ownership checks)
- ✅ Tailwind CSS configured and ready to use
- ✅ Routes integrated into App.js
- ✅ Navbar updated with Cars link

## 🔐 Role Rules

### Admin
- ✅ Can add any car listing
- ✅ Can edit any car listing
- ✅ Can delete any car listing

### Seller
- ✅ Can add new car listings
- ✅ Can edit ONLY their own car listings
- ✅ Can delete ONLY their own car listings

### Buyer / Normal User
- ✅ Can only view listings
- ✅ Cannot add, edit, or delete

## 📁 File Structure

### Backend
```
server/
├── src/
│   ├── models/
│   │   └── Car.js (NEW)
│   ├── middleware/
│   │   ├── auth.js (NEW)
│   │   └── roles.js (NEW)
│   ├── routes/
│   │   └── cars.js (NEW)
│   ├── scripts/
│   │   └── seedCars.js (NEW)
│   └── server.js (UPDATED)
```

### Frontend
```
client/
├── src/
│   ├── pages/
│   │   ├── CarList.jsx (NEW)
│   │   ├── AddCar.jsx (NEW)
│   │   └── EditCar.jsx (NEW)
│   ├── utils/
│   │   └── axios.js (NEW)
│   ├── App.js (UPDATED)
│   ├── index.js (UPDATED)
│   └── index.css (NEW - Tailwind)
├── tailwind.config.js (NEW)
└── postcss.config.js (NEW)
```

## 🎨 Dummy Car Listings

The seeder includes these 8 car listings:
1. Honda Civic (2020, $22,000, used)
2. Toyota Corolla (2019, $18,500, used)
3. Tesla Model 3 Long Range (2023, $48,000, new)
4. Ford Mustang GT (2021, $52,000, used)
5. Audi A4 (2022, $40,000, new)
6. BMW 3 Series 320i (2020, $35,000, used)
7. Hyundai Elantra (2018, $15,000, used)
8. Kia Sportage (2021, $28,000, new)

## ⚠️ Notes

1. **Tailwind CSS**: If you encounter issues with Tailwind, you may need to install `autoprefixer` and `postcss`:
   ```bash
   cd client
   npm install -D autoprefixer postcss
   ```

2. **Seller ID**: When running the seeder, make sure you have at least one user with role "seller" in your database, or provide a valid seller ObjectId.

3. **Authentication**: All protected routes require a valid JWT token in the Authorization header (automatically handled by the axios instance).

