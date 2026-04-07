# 471-project

## MotorWala Application

A full-stack web application with React frontend and Node.js/Express backend.

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- MongoDB running locally (or MongoDB Atlas connection string)

### Quick Start

1. **Install dependencies:**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

2. **Configure environment variables:**
   - Copy `server/.env.example` to `server/.env`
   - Update `MONGO_URI` with your MongoDB connection string
   - Default: `mongodb://localhost:27017/motorwala`

3. **Start the application:**
   
   **Option 1: Use the startup script (Windows PowerShell)**
   ```powershell
   .\start.ps1
   ```
   
   **Option 2: Manual start**
   ```bash
   # Terminal 1 - Start backend server
   cd server
   npm start
   
   # Terminal 2 - Start frontend client
   cd client
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

- `client/` - React frontend application
- `server/` - Node.js/Express backend API