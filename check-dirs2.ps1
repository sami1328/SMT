# Check for dynamic route directories with exact match for bracket names
$routes = Get-ChildItem -Path "src\app" -Recurse -Directory | Where-Object { $_.Name -match '\[.*?\]' }

$results = @()
foreach ($route in $routes) {
    $name = $route.Name
    $path = $route.FullName
    if ($name -eq '[...nextauth]') {
        continue # Skip nextauth directory
    }
    
    # Determine route type
    $type = "Unknown"
    $isConsistent = $false
    
    if ($name -eq '[cid]') {
        $type = "Club"
        $isConsistent = $true
    }
    elseif ($name -eq '[tid]') {
        $type = "Trainee"
        $isConsistent = $true
    }
    elseif ($name -eq '[sid]') {
        $type = "Scouter"
        $isConsistent = $true
    }
    elseif ($name -eq '[pid]') {
        $type = "Player"
        $isConsistent = $true
    }
    else {
        # Handle inconsistent names
        if ($name -eq '[id]' -or $name -eq '[clubId]' -or $name -eq '[tid]') {
            if ($path -like "*\club*\*") {
                $type = "Club (Inconsistent)"
            }
            elseif ($path -like "*\trainee*\*") {
                $type = "Trainee (Inconsistent)"
            }
            elseif ($path -like "*\scouter*\*") {
                $type = "Scouter (Inconsistent)"
            }
            elseif ($path -like "*\player*\*") {
                $type = "Player (Inconsistent)"
            }
        }
        elseif ($name -eq '[short_uid]') {
            $type = "Trainee Short UID (Inconsistent)"
        }
    }
    
    $results += [PSCustomObject]@{
        Path = $path
        Name = $name
        Type = $type
        IsConsistent = $isConsistent
    }
}

# Display results
Write-Host "CONSISTENT ROUTES:" -ForegroundColor Green
$results | Where-Object { $_.IsConsistent } | Format-Table Path, Name, Type

Write-Host "INCONSISTENT ROUTES:" -ForegroundColor Red
$inconsistentRoutes = $results | Where-Object { -not $_.IsConsistent }
if ($inconsistentRoutes.Count -gt 0) {
    $inconsistentRoutes | Format-Table Path, Name, Type
    Write-Host "WARNING: Found $($inconsistentRoutes.Count) inconsistent route(s)!" -ForegroundColor Red
} else {
    Write-Host "None found - all routes are consistent!" -ForegroundColor Green
} 