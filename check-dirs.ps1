# Check for dynamic route directories
$clubRoutes = Get-ChildItem -Path "src\app" -Recurse -Directory | Where-Object { $_.Name -like "*[cid]*" }
$traineeRoutes = Get-ChildItem -Path "src\app" -Recurse -Directory | Where-Object { $_.Name -like "*[tid]*" }
$scouterRoutes = Get-ChildItem -Path "src\app" -Recurse -Directory | Where-Object { $_.Name -like "*[sid]*" }
$playerRoutes = Get-ChildItem -Path "src\app" -Recurse -Directory | Where-Object { $_.Name -like "*[pid]*" }
$otherRoutes = Get-ChildItem -Path "src\app" -Recurse -Directory | Where-Object { 
    $_.Name -like "*[*]*" -and 
    $_.Name -notlike "*[cid]*" -and 
    $_.Name -notlike "*[tid]*" -and 
    $_.Name -notlike "*[sid]*" -and 
    $_.Name -notlike "*[pid]*" -and
    $_.Name -notlike "*[...nextauth]*"
}

Write-Host "Club routes ([cid]):" -ForegroundColor Green
$clubRoutes | ForEach-Object { Write-Host "  $_" }

Write-Host "`nTrainee routes ([tid]):" -ForegroundColor Green
$traineeRoutes | ForEach-Object { Write-Host "  $_" }

Write-Host "`nScouter routes ([sid]):" -ForegroundColor Green
$scouterRoutes | ForEach-Object { Write-Host "  $_" }

Write-Host "`nPlayer routes ([pid]):" -ForegroundColor Green
$playerRoutes | ForEach-Object { Write-Host "  $_" }

Write-Host "`nOther dynamic routes:" -ForegroundColor Yellow
if ($otherRoutes.Count -gt 0) {
    $otherRoutes | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host "`nWARNING: There are still inconsistent dynamic route names!" -ForegroundColor Red
} else {
    Write-Host "  None found - all routes are consistent!" -ForegroundColor Green
} 