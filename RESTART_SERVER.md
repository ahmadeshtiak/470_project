# How to Restart the Server

## Quick Steps

### Option 1: Using the Same Window

1. **Find the server window**
   - Look for a PowerShell or Command Prompt window
   - It should show messages like "✅ Server running on port 5000"

2. **Stop the server**
   - Click in that window to focus it
   - Press `Ctrl+C` (hold Ctrl key and press C)
   - Wait for it to stop

3. **Restart the server**
   - In the same window, type:
     ```powershell
     cd server
     npm start
     ```
   - Press Enter

4. **Verify it worked**
   - You should see:
     ```
     ✅ Auth routes registered:
       POST /api/auth/signup
       POST /api/auth/login
       POST /api/auth/logout
       GET /api/auth/profile
       PUT /api/auth/profile
     ✅ Server running on port 5000
     ```

### Option 2: Using a New Window

1. **Stop the old server**
   - Find the server window
   - Press `Ctrl+C` to stop it

2. **Open a new PowerShell window**
   - Press `Win + X` and select "Windows PowerShell" or "Terminal"
   - Or search for "PowerShell" in Start menu

3. **Navigate to project and start server**
   ```powershell
   cd E:\BRACU\Fall25\CSE471\Project\471-project\server
   npm start
   ```

### Option 3: Using the Restart Script

1. **Open PowerShell in project root**
   ```powershell
   cd E:\BRACU\Fall25\CSE471\Project\471-project
   ```

2. **Run the restart script**
   ```powershell
   .\restart-server.ps1
   ```

## Troubleshooting

**If Ctrl+C doesn't work:**
- Try pressing it multiple times
- Or close the window entirely and open a new one

**If you get "port already in use" error:**
- The old server is still running
- Find and close that process, or restart your computer

**If you don't see the route registration message:**
- Check for any error messages in the console
- Make sure you're in the `server` directory
- Verify `npm start` is running

## After Restart

Once the server restarts successfully:
1. The Edit Profile feature will work
2. You can test it with: `.\test-profile-endpoint.ps1`
3. Or just try using the Edit Profile page in your browser



