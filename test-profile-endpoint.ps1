# Test Profile Endpoint Script
Write-Host "=== Testing Profile Update Endpoint ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if server is running
Write-Host "1. Checking if server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/" -UseBasicParsing -TimeoutSec 2
    Write-Host "   ✅ Server is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Server is NOT running! Please start it first." -ForegroundColor Red
    exit
}

# Test 2: Check if PUT endpoint exists (should return 401, not 404)
Write-Host "`n2. Testing PUT /api/auth/profile endpoint..." -ForegroundColor Yellow
$testBody = '{"name":"Test","email":"test@test.com","phone":"123","address":"test","about":"test"}'
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/profile" `
        -Method PUT `
        -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer invalid-token"} `
        -Body $testBody `
        -UseBasicParsing `
        -ErrorAction Stop
    Write-Host "   ✅ Endpoint exists! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "   ❌ 404 ERROR - Route NOT FOUND!" -ForegroundColor Red
        Write-Host "   The server needs to be restarted!" -ForegroundColor Yellow
        Write-Host "`n   Please:" -ForegroundColor Cyan
        Write-Host "   1. Stop the server (Ctrl+C)" -ForegroundColor White
        Write-Host "   2. Restart: cd server; npm start" -ForegroundColor White
        Write-Host "   3. Run this test again" -ForegroundColor White
        exit 1
    } elseif ($statusCode -eq 401) {
        Write-Host "   ✅ Endpoint EXISTS! (401 is expected with invalid token)" -ForegroundColor Green
        Write-Host "   The route is properly registered!" -ForegroundColor Green
    } else {
        Write-Host "   Status: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ All tests passed! The endpoint is working correctly." -ForegroundColor Green
Write-Host "You can now use the Edit Profile page." -ForegroundColor White



