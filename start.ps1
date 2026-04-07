# Start script for MotorWala application
Write-Host "Starting MotorWala Application..." -ForegroundColor Green

# Check if .env file exists in server directory
if (-not (Test-Path "server\.env")) {
    Write-Host "⚠️  Warning: server\.env file not found!" -ForegroundColor Yellow
    Write-Host "Creating server\.env file with default MongoDB URI..." -ForegroundColor Yellow
    @"
PORT=5000
MONGO_URI=mongodb://localhost:27017/motorwala
"@ | Out-File -FilePath "server\.env" -Encoding utf8
    Write-Host "✅ Created server\.env file" -ForegroundColor Green
    Write-Host "⚠️  Make sure MongoDB is running on localhost:27017" -ForegroundColor Yellow
    Write-Host "   Or update MONGO_URI in server\.env with your MongoDB connection string" -ForegroundColor Yellow
}

# Start server
Write-Host "`n🚀 Starting backend server on port 5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm start" -WindowStyle Normal

# Wait a bit for server to start
Start-Sleep -Seconds 3

# Start client
Write-Host "🚀 Starting frontend client on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm start" -WindowStyle Normal

Write-Host "`n✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host "   Backend: http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`nThe browser should open automatically. If not, navigate to http://localhost:3000" -ForegroundColor Yellow




