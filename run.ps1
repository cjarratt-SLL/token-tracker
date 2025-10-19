<#
Token Tracker Startup Script
Author: [Your Name]
Purpose: Launch FastAPI backend and Vite frontend with synchronized ports
#>

Write-Host "🚀 Starting Token Tracker..." -ForegroundColor Cyan

# 1️⃣ Activate Virtual Environment
Write-Host "Activating virtual environment..."
$venvPath = "C:\Projects\token-tracker\venv\Scripts\Activate.ps1"
if (Test-Path $venvPath) {
    & $venvPath
} else {
    Write-Host "⚠️ Virtual environment not found at $venvPath" -ForegroundColor Yellow
}

# 2️⃣ Verify Dependencies
$requirements = "C:\Projects\token-tracker\backend\requirements.txt"
if (Test-Path $requirements) {
    Write-Host "📦 Checking backend dependencies..."
    pip install -r $requirements | Out-Null
} else {
    Write-Host "⚠️ No requirements.txt found. Skipping backend dependency check."
}

# 3️⃣ Paths and Setup
$projectRoot = "C:\Projects\token-tracker"
$backendRoot = "C:\Projects\token-tracker"
$frontendRoot = "$projectRoot\frontend"
$logDir = "$projectRoot\logs"

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

# 4️⃣ Launch Backend and Detect Actual Port
Write-Host "🐍 Launching backend..."
$pythonExe = "$projectRoot\venv\Scripts\python.exe"

if (-not (Test-Path $backendRoot)) {
    Write-Host "⚠️ Backend directory not found at $backendRoot" -ForegroundColor Yellow
} else {
    Push-Location $backendRoot
    & $pythonExe -m uvicorn main:app --reload *> "$logDir\backend.log" 2>&1 &
    Pop-Location
}
Write-Host "🕓 Waiting for backend to initialize..."
Start-Sleep -Seconds 3

# 5️⃣ Extract Actual Port from Log
$backendLogPath = "$logDir\backend.log"
$backendPort = $null
if (Test-Path $backendLogPath) {
    $backendLog = Get-Content -Path $backendLogPath -ErrorAction SilentlyContinue
    $backendPort = ($backendLog | Select-String -Pattern 'http://127\.0\.0\.1:(\d+)' |
                    ForEach-Object { $_.Matches.Groups[1].Value } | Select-Object -Last 1)
}
if (-not $backendPort) {
    Write-Host "⚠️ Could not detect backend port automatically. Defaulting to 8000."
    $backendPort = "8000"
}

Write-Host "✅ Detected backend port: $backendPort"

# 6️⃣ Update Frontend Environment File
$envFile = "$frontendRoot\.env"
$apiUrl  = "VITE_API_BASE_URL=http://127.0.0.1:$backendPort"

if (-not (Test-Path $envFile) -or (Get-Content $envFile -Raw).Trim() -ne $apiUrl) {
    Set-Content -Path $envFile -Value $apiUrl
    Write-Host "✅ Updated frontend .env → $apiUrl"
} else {
    Write-Host "ℹ️ Frontend .env already up to date."
}

# 7️⃣ Launch Frontend (Vite)
Write-Host "🌐 Launching frontend silently with logging..."
$frontendLog = "$logDir\frontend.log"
$frontendCmd = "Set-Location `"$frontendRoot`"; npm run dev *> `"$frontendLog`" 2>&1"
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit","-ExecutionPolicy","Bypass","-Command",$frontendCmd -PassThru

# 8️⃣ Wait and Open Browser
Write-Host "🕓 Waiting for frontend to start..."
Start-Sleep -Seconds 5

$frontendUrl = "http://localhost:5173"
Start-Process $frontendUrl

# 9️⃣ Summary
Write-Host ""
Write-Host "🎉 All systems running!" -ForegroundColor Green
Write-Host "   - Backend:  http://127.0.0.1:$backendPort (logs: $backendLogPath)"
Write-Host "   - Frontend: $frontendUrl (logs: $frontendLog)"
Write-Host ""
Write-Host "💡 Tip: Set `$DEBUG_MODE = True above to view consoles for debugging."
