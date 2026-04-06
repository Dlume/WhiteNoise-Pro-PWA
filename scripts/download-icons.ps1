# WhiteNoise Pro - Icon Download Script

param(
    [string]$OutputDir = "D:\cowapout\WhiteNoise-Pro\assets\icons",
    [string]$IconCdnUrl = "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/solid",
    [switch]$UseLocalBackup
)

$ErrorActionPreference = "Stop"

Write-Host "[Icon Download] Starting..." -ForegroundColor Cyan

$RequiredIcons = @(
    "music", "play", "pause", "stop", "volume-up", "volume-down",
    "cloud-rain", "water", "fire", "wind", "tree", "coffee",
    "bird", "leaf", "sun", "moon", "star", "heart"
)

$downloadCount = 0
$failCount = 0

foreach ($iconName in $RequiredIcons) {
    try {
        $svgUrl = "$IconCdnUrl/$iconName.svg"
        $outputPath = Join-Path $OutputDir "$iconName.svg"
        
        Invoke-WebRequest -Uri $svgUrl -OutFile $outputPath -UseBasicParsing
        Write-Host "  Downloaded: $iconName.svg" -ForegroundColor Gray
        $downloadCount++
    }
    catch {
        Write-Host "  Failed: $iconName.svg" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "[Icon Download] Completed!" -ForegroundColor Green
Write-Host "  Success: $downloadCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Yellow" })

# Generate icon list
$iconList = Get-ChildItem -Path $OutputDir -Filter "*.svg" | Select-Object Name
$iconList | Out-File -FilePath (Join-Path $OutputDir "icon-list.txt") -Encoding UTF8
Write-Host "  Icon list generated" -ForegroundColor Gray

exit 0
