# OTP Email Verification - Action Checklist

## 📋 Pre-Setup Checklist

### Gmail Configuration
- [ ] Visit: https://myaccount.google.com/
- [ ] Click "Security" in left menu
- [ ] Find "App passwords"
- [ ] Select "Mail" and "Windows Computer"
- [ ] Copy 16-character app password
- [ ] Keep this password safe

### Project Setup
- [ ] Verify nodemailer is installed: `npm list nodemailer`
- [ ] Check server/.env exists
- [ ] Ensure MongoDB connection is configured
- [ ] Verify Node.js is version 14+

---

## 🔧 Configuration Checklist

### Update server/.env
- [ ] Open: `server/.env`
- [ ] Find: `EMAIL_USER=` line
- [ ] Replace with: Your Gmail address
- [ ] Find: `EMAIL_PASSWORD=` line
- [ ] Replace with: 16-char app password
- [ ] Save file
- [ ] Do NOT commit this file to git

Example:
```env
EMAIL_USER=autoforge@gmail.com
EMAIL_PASSWORD=abcd1234efgh5678
```

### Verify Configuration
- [ ] Check EMAIL_USER is valid Gmail
- [ ] Check EMAIL_PASSWORD is 16 characters
- [ ] Check no extra spaces in .env
- [ ] Check .env file is in server folder root

---

## 🚀 Service Startup Checklist

### Start Backend Server
```bash
cd server
npm run dev
```

Expected output:
- [ ] ✅ Server running on port 5000
- [ ] ✅ MongoDB Connected Successfully
- [ ] No error messages

### Start Frontend
```bash
cd client
npm start
```

Expected output:
- [ ] Port 3000 opens in browser
- [ ] React app loads
- [ ] No console errors

---

## ✅ Functionality Checklist

### Test Signup Flow
- [ ] Navigate to http://localhost:3000/signup
- [ ] Fill all form fields:
  - [ ] Full Name: Enter any name
  - [ ] Email: Use YOUR email
  - [ ] Phone: Enter any phone
  - [ ] Address: Enter any address
  - [ ] About: Enter any text (max 100 words)
  - [ ] Password: Enter password (min 6 chars)
  - [ ] Confirm: Enter same password
- [ ] Click "Sign Up" button
- [ ] Wait for response

Expected:
- [ ] See message: "OTP sent to your email"
- [ ] Page changes to OTP verification screen
- [ ] No error messages in console

### Check Email
- [ ] Open email inbox (check promotions/spam)
- [ ] Look for email from: autoforge@gmail.com
- [ ] Subject: "Email Verification - AutoForge"
- [ ] Copy the 6-digit OTP

Example email:
```
Subject: Email Verification - AutoForge

Your OTP: 123456
Valid for 10 minutes
```

### Verify OTP
- [ ] Go back to browser
- [ ] Paste 6-digit OTP in input field
- [ ] Click "Verify OTP" button
- [ ] Wait for response

Expected:
- [ ] See message: "Email verified successfully!"
- [ ] Automatically redirect to dashboard
- [ ] No error messages

### Verify User is Logged In
- [ ] Check URL changed to dashboard
- [ ] Check user profile/name visible
- [ ] Open browser DevTools → Application
- [ ] Check localStorage has "token"
- [ ] Token should be long JWT string

---

## 🧪 Extended Testing Checklist

### Test Wrong OTP
- [ ] Do signup again (use different email)
- [ ] Receive OTP email
- [ ] Enter WRONG OTP
- [ ] Click "Verify OTP"

Expected:
- [ ] See error: "Invalid OTP"
- [ ] Stay on OTP page
- [ ] Can try again

### Test OTP Expiry
- [ ] Do signup again
- [ ] Receive OTP email
- [ ] Wait 10+ minutes
- [ ] Enter OTP (should be expired now)
- [ ] Click "Verify OTP"

Expected:
- [ ] See error: "OTP has expired"
- [ ] Click "Resend OTP"
- [ ] Receive new OTP email
- [ ] New OTP should work

### Test Resend OTP
- [ ] Do signup
- [ ] Get to OTP page
- [ ] Don't receive first email
- [ ] Click "Resend OTP"
- [ ] Check email for new OTP

Expected:
- [ ] Receive new OTP email
- [ ] See message: "OTP resent"
- [ ] New OTP is different from first
- [ ] New OTP should work

### Test Duplicate Email (Verified)
- [ ] Complete signup with user1@gmail.com
- [ ] Logout (if there's logout button)
- [ ] Try to signup again with user1@gmail.com

Expected:
- [ ] See error: "Email already registered"
- [ ] Cannot signup with same email

### Test Duplicate Email (Unverified)
- [ ] Do signup with user2@gmail.com
- [ ] Don't verify (don't enter OTP)
- [ ] Try signup again with user2@gmail.com

Expected:
- [ ] Should allow re-signup
- [ ] Should send new OTP
- [ ] Can verify with new OTP

---

## 🔍 Verification Checklist

### Backend Logs
Open terminal with `npm run dev` running:

Check for:
- [ ] "OTP sent to email" message
- [ ] No error messages
- [ ] Database save successful
- [ ] Email sending successful

Example:
```
✅ OTP generated: 123456
✅ User created/updated
✅ OTP email sent successfully
✅ OTP verification request received
✅ OTP verified successfully
✅ Welcome email sent
```

### Frontend Console
Open DevTools (F12) → Console:

Check for:
- [ ] No red error messages
- [ ] No warning about unhandled promises
- [ ] No network errors
- [ ] Auth token in localStorage

### Email Verification
- [ ] OTP email received with HTML formatting
- [ ] OTP clearly visible in email
- [ ] "10 minutes" validity shown
- [ ] Professional looking template
- [ ] Welcome email received after verification

### Database Verification (Optional)
Using MongoDB Compass or MongoDB Atlas:

- [ ] User created in database
- [ ] otp field is null (after verification)
- [ ] otpExpiry is null (after verification)
- [ ] isEmailVerified is true (after verification)
- [ ] password is hashed

---

## 🚨 Troubleshooting Checklist

### Email Not Received
- [ ] Check spam/junk folder
- [ ] Wait 2-3 minutes (email can be slow)
- [ ] Check email address is correct
- [ ] Check EMAIL_USER in .env is correct
- [ ] Check EMAIL_PASSWORD is valid app password
- [ ] Check backend logs for "OTP sent" message
- [ ] Try resending OTP

### "Failed to send OTP" Error
- [ ] Check EMAIL_USER is valid Gmail
- [ ] Check EMAIL_PASSWORD is 16-char app password
- [ ] NOT regular Gmail password (use App Password)
- [ ] Check .env file has no extra spaces
- [ ] Restart backend after changing .env
- [ ] Check Gmail 2FA is enabled
- [ ] Visit: https://accounts.google.com/DisplayUnlockCaptcha

### "Invalid OTP" Error
- [ ] Make sure you copied OTP correctly
- [ ] Check no extra spaces
- [ ] Check OTP is 6 digits
- [ ] Check OTP hasn't expired (10 min)
- [ ] Try resending and using new OTP

### Can't See OTP Page
- [ ] Check browser console for errors
- [ ] Check backend logs for errors
- [ ] Verify signup completed (check backend output)
- [ ] Refresh browser page
- [ ] Check network tab for failed requests

### Page Doesn't Redirect
- [ ] Check OTP verification succeeded
- [ ] Check backend returned token
- [ ] Check browser console for errors
- [ ] Try manual navigation to /dashboard
- [ ] Check localStorage for token

### Form Validation Issues
- [ ] Check all fields filled before signup
- [ ] Check password matches confirm password
- [ ] Check "about" is max 100 words
- [ ] Check email is valid format
- [ ] Check password is min 6 characters

---

## 📊 Data Verification Checklist

### Check User Document (Optional - MongoDB)
```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...",  // hashed
  phone: "01712345678",
  address: "Dhaka",
  about: "Text...",
  role: "buyer",
  otp: null,              // cleared after verification
  otpExpiry: null,        // cleared after verification
  isEmailVerified: true,  // marked as verified
  createdAt: Date,
  updatedAt: Date
}
```

Check:
- [ ] All fields present
- [ ] OTP is null (after verification)
- [ ] otpExpiry is null (after verification)
- [ ] isEmailVerified is true
- [ ] password is hashed (starts with $2a$)

---

## 🔒 Security Checklist

- [ ] Password is hashed (not plain text)
- [ ] OTP is not sent back to frontend
- [ ] OTP expires after 10 minutes
- [ ] OTP is cleared after verification
- [ ] Each user has unique OTP
- [ ] Email verification required
- [ ] JWT token generated after verification
- [ ] .env file is in .gitignore

---

## 🎯 Final Verification

### Complete End-to-End Flow
- [ ] User fills signup form
- [ ] OTP sent to email
- [ ] User receives OTP
- [ ] User enters OTP
- [ ] User verified
- [ ] Welcome email sent
- [ ] User logged in
- [ ] User in dashboard
- [ ] All database fields correct

### Performance Check
- [ ] Signup completes in < 5 seconds
- [ ] OTP email arrives in < 2 minutes
- [ ] OTP verification in < 2 seconds
- [ ] Page transitions smooth
- [ ] No lag or freezing

### Browser Compatibility Check
- [ ] Works on Chrome
- [ ] Works on Firefox
- [ ] Works on Edge
- [ ] Works on Safari (if available)
- [ ] Mobile responsive

---

## 📝 Status Tracking

### Before Setup
- [ ] All prerequisites met
- [ ] Gmail password generated
- [ ] Configuration ready

### During Setup
- [ ] Backend started successfully
- [ ] Frontend started successfully
- [ ] Services communicating

### After Testing
- [ ] All tests passed
- [ ] No errors in logs
- [ ] All features working
- [ ] Ready for production

---

## 🎉 Success Criteria

You're done when:
✅ User can signup with email
✅ OTP is sent to email
✅ User can verify OTP
✅ User gets logged in
✅ Welcome email received
✅ No errors in console
✅ User data in database

---

## 📞 Quick Reference

| Issue | Location to Check |
|-------|------------------|
| Email not sent | Backend logs |
| Can't verify | Frontend console |
| Wrong error | Network tab |
| Database issue | MongoDB Atlas |
| Config issue | server/.env |
| Email template | server/src/utils/email.js |
| Frontend logic | client/src/pages/Signup.js |

---

## ✅ Sign-Off Checklist

- [ ] Gmail configured
- [ ] .env updated
- [ ] Backend running
- [ ] Frontend running
- [ ] Signup flow tested
- [ ] Email received
- [ ] OTP verified
- [ ] User logged in
- [ ] Dashboard accessible
- [ ] All logs clean
- [ ] Ready to deploy

---

**Total Time:** ~30 minutes
**Difficulty:** Beginner-Friendly
**Status:** Ready to Start ✅

Start with Step 1: **Gmail Configuration** ↓

---

# 🚀 LET'S GET STARTED!

1. Generate Gmail App Password
2. Update server/.env
3. Start services
4. Test the flow

You've got this! 💪
