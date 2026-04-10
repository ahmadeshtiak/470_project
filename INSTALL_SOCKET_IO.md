# Manual Installation Instructions for socket.io-client

The automatic installation seems to be having issues. Please follow these steps manually:

## Steps to Install socket.io-client:

1. **Open PowerShell in the client directory:**
   ```powershell
   cd "E:\BRACU\Fall25\CSE471\Project module 3\471-project Module 3\client"
   ```

2. **Stop the React dev server** (if running):
   - Press `Ctrl + C` in the terminal running `npm start`

3. **Install socket.io-client:**
   ```powershell
   npm install socket.io-client@4.7.5 --save
   ```

4. **Verify installation:**
   ```powershell
   npm list socket.io-client
   ```

5. **If that doesn't work, try:**
   ```powershell
   npm cache clean --force
   npm install socket.io-client@4.7.5 --save --legacy-peer-deps
   ```

6. **Restart the React dev server:**
   ```powershell
   npm start
   ```

## Alternative: If npm install fails

If npm install continues to fail, you can try:

1. Delete `node_modules` and `package-lock.json`:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force package-lock.json
   ```

2. Reinstall all dependencies:
   ```powershell
   npm install
   ```

This should install socket.io-client along with all other dependencies.




