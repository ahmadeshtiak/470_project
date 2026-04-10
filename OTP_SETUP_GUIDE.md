# OTP Email Verification Setup Guide

## Overview
This document guides you through setting up OTP (One-Time Password) email verification for the signup process.

## What Was Implemented

### Backend Changes

1. **Updated User Model** (`server/src/models/User.js`)
   - Added `otp` field to store the generated OTP
   - Added `otpExpiry` field to track OTP expiration (10 minutes)
   - Added `isEmailVerified` field to track email verification status

2. **Created Email Utility** (`server/src/utils/email.js`)
   - `generateOTP()` - Generates a random 6-digit OTP
   - `sendOTPEmail()` - Sends OTP to user's email with HTML template
   - `sendWelcomeEmail()` - Sends welcome email after verification

3. **Updated Auth Routes** (`server/src/routes/auth.js`)
   - **POST `/api/auth/signup`** - Modified to generate OTP instead of creating verified user
   - **POST `/api/auth/verify-otp`** - New endpoint to verify OTP and complete registration
   - **POST `/api/auth/resend-otp`** - New endpoint to resend OTP if needed

### Frontend Changes

1. **Updated Signup Component** (`client/src/pages/Signup.js`)
   - Two-step signup process:
     - Step 1: Fill signup form
     - Step 2: Enter OTP received via email
   - Added OTP input field with 6-digit validation
   - Added "Resend OTP" button
   - Added success/error messages

2. **Updated AuthContext** (`client/src/context/AuthContext.js`)
   - Added `verifyOTP()` function for OTP verification
   - Added `resendOTP()` function to resend OTP
   - Modified `signup()` to NOT set token (user must verify OTP first)

## Setup Instructions

### Step 1: Install Dependencies
The required package `nodemailer` is already installed. If not, run:
```bash
npm install nodemailer
```

### Step 2: Configure Environment Variables
Edit `server/.env` and add your Gmail credentials:

```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
```

#### How to Generate Gmail App Password:
1. Go to https://myaccount.google.com/
2. Click "Security" in the left menu
3. Scroll down to "App passwords"
4. Select "Mail" and "Windows Computer" (or your device)
5. Google will generate a 16-character password
6. Copy this password and paste it into the `.env` file

**Important:** Do NOT use your regular Gmail password. Use the App Password instead.

### Step 3: Test the OTP System

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd client
   npm start
   ```

3. **Test the signup flow:**
   - Go to the signup page
   - Fill in all form fields
   - Click "Sign Up"
   - Check your email inbox for the OTP
   - Enter the OTP on the verification page
   - Upon successful verification, you'll be redirected to the dashboard

## How It Works

### Signup Flow
```
User fills signup form
    ↓
Backend generates 6-digit OTP
    ↓
OTP is sent via email
    ↓
User receives OTP in inbox
    ↓
User enters OTP on verification page
    ↓
OTP is verified (checked against expiry: 10 minutes)
    ↓
User account is marked as verified
    ↓
Auth token is generated and user is logged in
    ↓
User redirected to dashboard
```

### OTP Validation
- OTP is a random 6-digit number
- OTP is valid for 10 minutes after generation
- If OTP is incorrect or expired, user can request a new one
- User must verify email before accessing the application

## API Endpoints

### 1. Signup
- **URL:** `POST /api/auth/signup`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "confirmPassword": "secure123",
  "phone": "01712345678",
  "address": "123 Main St",
  "about": "I am a car enthusiast..."
}
```
- **Response:**
```json
{
  "success": true,
  "message": "User registered. OTP sent to your email.",
  "email": "john@example.com",
  "requiresVerification": true
}
```

### 2. Verify OTP
- **URL:** `POST /api/auth/verify-otp`
- **Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": true,
    ...
  }
}
```

### 3. Resend OTP
- **URL:** `POST /api/auth/resend-otp`
- **Body:**
```json
{
  "email": "john@example.com"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully",
  "email": "john@example.com"
}
```

## Email Templates

### OTP Email
- Contains the 6-digit OTP in large, clear format
- Shows validity period (10 minutes)
- Professional HTML template
- Clear call-to-action

### Welcome Email
- Sent after successful email verification
- Welcomes user to the platform
- Lists features available
- Professional branding

## Troubleshooting

### "Failed to send OTP" Error
- Check if EMAIL_USER and EMAIL_PASSWORD are correctly set in `.env`
- Ensure you're using Gmail App Password (not regular password)
- Check if "Less secure app access" is enabled (if not using App Password)

### "OTP has expired" Error
- OTP is valid for 10 minutes only
- Click "Resend OTP" to generate a new one

### Email not received
- Check spam/junk folder
- Verify email address is spelled correctly
- Wait 2-3 minutes for email delivery

### "Email already registered" Error
- If trying to re-signup with same email
- You can resend OTP if you haven't completed verification
- Or use a different email address

## Security Notes

1. OTP is stored in database (not sent back to frontend)
2. OTP expires after 10 minutes
3. OTP is cleared after successful verification
4. Password is hashed before storage
5. Email is verified before account activation
6. Use HTTPS in production (set EMAIL_USER as environment variable securely)

## Future Enhancements

- Add SMS OTP option
- Add OTP rate limiting (prevent brute force)
- Add email resend rate limiting
- Add OTP attempt counter
- Add analytics for signup verification rates
- Add password reset with OTP

## Support

For issues or questions regarding OTP implementation:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check browser console and server logs for error messages
4. Ensure backend and frontend are running on correct ports
