# Script to rename folders
# Close Cursor/VS Code and any Node processes before running this script

Write-Host "Renaming folders..." -ForegroundColor Green

# Rename client-frontend to frontend_client
if (Test-Path "client-frontend") {
    Write-Host "Renaming client-frontend to frontend_client..." -ForegroundColor Yellow
    Rename-Item -Path "client-frontend" -NewName "frontend_client" -Force
    Write-Host "✓ Renamed client-frontend to frontend_client" -ForegroundColor Green
} else {
    Write-Host "✗ client-frontend not found" -ForegroundColor Red
}

# Rename frontend to frontend_admin
if (Test-Path "frontend") {
    Write-Host "Renaming frontend to frontend_admin..." -ForegroundColor Yellow
    Rename-Item -Path "frontend" -NewName "frontend_admin" -Force
    Write-Host "✓ Renamed frontend to frontend_admin" -ForegroundColor Green
} else {
    Write-Host "✗ frontend not found" -ForegroundColor Red
}

Write-Host "`nDone! Now run:" -ForegroundColor Green
Write-Host "  git add -A" -ForegroundColor Cyan
Write-Host "  git commit -m 'Rename frontend folders: frontend -> frontend_admin, client-frontend -> frontend_client'" -ForegroundColor Cyan
Write-Host "  git push origin master" -ForegroundColor Cyan

