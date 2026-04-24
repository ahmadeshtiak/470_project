# Restart Server Script for AutoForge
Write-Host "=== AutoForge Server Restart ===" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "Checking for running Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node process(es)." -ForegroundColor Yellow
    Write-Host "Please stop the server manually (Ctrl+C in the server window)" -ForegroundColor Yellow
    Write-Host "Or press Enter to continue (server will be started in a new window)..." -ForegroundColor Yellow
    Read-Host
} else {
    Write-Host "No Node processes found. Starting fresh..." -ForegroundColor Green
}

# Start server in new window
Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Green
$serverPath = Join-Path $PSScriptRoot "server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; Write-Host 'Starting Backend Server...' -ForegroundColor Cyan; npm start"

Start-Sleep -Seconds 3

# Test the endpoint
Write-Host ""
Write-Host "Testing endpoint..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/profile" -Method PUT -Headers @{"Content-Type"="application/json"} -Body '{"test":"test"}' -UseBasicParsing -ErrorAction Stop
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Server is running and endpoint exists! (401 is expected without auth)" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "❌ Still getting 404. Wait a few more seconds for server to fully start..." -ForegroundColor Yellow
    } else {
        Write-Host "Response: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Server restart initiated!" -ForegroundColor Green
Write-Host "The server window should be open. Check it for any errors." -ForegroundColor White
Write-Host ""
Write-Host "You should see this message when server starts:" -ForegroundColor Cyan
Write-Host "  ✅ Auth routes registered:" -ForegroundColor White
Write-Host "    PUT /api/auth/profile" -ForegroundColor White



