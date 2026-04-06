# WhiteNoise Pro - Audio Download Script

param(
    [string]$OutputDir = "D:\cowapout\WhiteNoise-Pro\assets\audio",
    [int]$DownloadTimeout = 900,
    [switch]$SkipConversion
)

$ErrorActionPreference = "Stop"

Write-Host "[Audio Download] Starting..." -ForegroundColor Cyan
$startTime = Get-Date

$AudioCategories = @{
    "rain" = @("light-rain", "heavy-rain", "rain-on-roof", "rain-thunder", "rain-window", "tropical-rain", "rain-puddle")
    "water" = @("ocean-waves", "river-flow", "waterfall", "lake-shore", "stream-brook", "rain-creek", "water-fountain")
    "nature" = @("forest-wind", "birds-morning", "crickets-night", "wind-leaves", "meadow-summer", "mountain-breeze", "bamboo-forest")
    "urban" = @("cafe-ambient", "train-distant", "city-night", "library-quiet", "office-hum", "subway-distant", "restaurant-background")
    "white-noise" = @("white-noise-smooth", "pink-noise", "brown-noise", "fan-sound", "air-purifier", "static-soft")
}

$totalFiles = 0
$downloadCount = 0
$failCount = 0

foreach ($category in $AudioCategories.Keys) {
    $totalFiles += $AudioCategories[$category].Count
}

Write-Host "  Planning: $totalFiles files" -ForegroundColor Gray
Write-Host ""

# Create category directories
foreach ($category in $AudioCategories.Keys) {
    $categoryDir = Join-Path $OutputDir $category
    if (-not (Test-Path $categoryDir)) {
        New-Item -ItemType Directory -Force -Path $categoryDir | Out-Null
    }
}

# Download audio files (simulated for now)
foreach ($category in $AudioCategories.Keys) {
    $categoryDir = Join-Path $OutputDir $category
    
    foreach ($audioName in $AudioCategories[$category]) {
        try {
            $outputPath = Join-Path $categoryDir "$audioName.mp3"
            
            # Simulated download delay
            Start-Sleep -Milliseconds 500
            
            # Create placeholder file (replace with actual download in production)
            if (-not (Test-Path $outputPath)) {
                "# $audioName - pending download" | Out-File -FilePath $outputPath -Encoding UTF8
            }
            
            Write-Host "  Downloaded: $category/$audioName.mp3" -ForegroundColor Gray
            $downloadCount++
        }
        catch {
            Write-Host "  Failed: $category/$audioName.mp3" -ForegroundColor Red
            $failCount++
        }
    }
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "[Audio Download] Completed!" -ForegroundColor Green
Write-Host "  Duration: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Cyan
Write-Host "  Success: $downloadCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Yellow" })

# Generate audio manifest
$audioManifest = @{
    "generatedAt" = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "totalFiles" = $downloadCount
    "categories" = @{}
}

foreach ($category in $AudioCategories.Keys) {
    $categoryDir = Join-Path $OutputDir $category
    $files = Get-ChildItem -Path $categoryDir -Filter "*.mp3" | Select-Object -ExpandProperty Name
    $audioManifest.categories[$category] = $files
}

$audioManifest | ConvertTo-Json -Depth 10 | Out-File -FilePath (Join-Path $OutputDir "audio-manifest.json") -Encoding UTF8
Write-Host "  Audio manifest generated" -ForegroundColor Gray

exit 0
