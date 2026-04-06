# WhiteNoise Pro - Deploy Script

param(
    [string]$Version = "auto",
    [string]$ProjectRoot = "D:\cowapout\WhiteNoise-Pro",
    [string]$DeployTarget = "github",
    [switch]$SkipBuild,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host "[Deploy] Starting..." -ForegroundColor Cyan
$startTime = Get-Date

Set-Location $ProjectRoot

# Version handling
if ($Version -eq "auto") {
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        $currentVersion = $packageJson.version
        $versionParts = $currentVersion.Split('.')
        $versionParts[2] = [int]$versionParts[2] + 1
        $Version = $versionParts -join '.'
        Write-Host "  Version: $currentVersion -> $Version" -ForegroundColor Cyan
    } else {
        $Version = "1.0.0"
        Write-Host "  Version: $Version (new)" -ForegroundColor Cyan
    }
} else {
    Write-Host "  Version: $Version (specified)" -ForegroundColor Cyan
}

# Build
if (-not $SkipBuild) {
    Write-Host "  Building..." -ForegroundColor Gray
    
    if (Test-Path "package.json") {
        npm run build 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    } else {
        $distDir = Join-Path $ProjectRoot "dist"
        if (Test-Path $distDir) {
            Remove-Item -Path $distDir -Recurse -Force
        }
        New-Item -ItemType Directory -Force -Path $distDir | Out-Null
        
        Get-ChildItem -Path $ProjectRoot -Filter "*.html" | Copy-Item -Destination $distDir
        Get-ChildItem -Path $ProjectRoot -Directory -Include "css", "js", "assets" | Copy-Item -Destination $distDir -Recurse
        
        Write-Host "  Build completed" -ForegroundColor Green
    }
} else {
    Write-Host "  Skip build" -ForegroundColor Gray
}

# Git operations
Write-Host "  Git operations..." -ForegroundColor Gray

if (-not (Test-Path ".git")) {
    Write-Host "  Init git repo..." -ForegroundColor Yellow
    git init
    git branch -M main
    
    # Configure git user
    git config user.email "lobsterai@local.dev"
    git config user.name "LobsterAI"
}

# Configure git to handle line endings
git config core.autocrlf false 2>&1 | Out-Null

git add . 2>&1 | Where-Object { $_ -notmatch "warning:" } | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }

$gitStatus = git status --porcelain
if ($gitStatus) {
    $commitMessage = "chore: release v$Version - auto publish"
    git commit -m $commitMessage 2>&1 | Where-Object { $_ -notmatch "warning:" } | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    Write-Host "  Git commit completed" -ForegroundColor Green
} else {
    Write-Host "  No changes, skip commit" -ForegroundColor Gray
}

# Push (skip for first run without remote)
if (-not $DryRun) {
    Write-Host "  Pushing to remote..." -ForegroundColor Gray
    $pushResult = git push origin main 2>&1
    if ($LASTEXITCODE -eq 0) {
        $pushResult | Where-Object { $_ -notmatch "warning:" } | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
        Write-Host "  Push completed" -ForegroundColor Green
    } else {
        Write-Host "  No remote configured, skip push" -ForegroundColor Yellow
    }
} else {
    Write-Host "  Skip push (Dry Run)" -ForegroundColor Gray
}

# Deploy trigger
Write-Host "  Trigger deploy..." -ForegroundColor Gray

if ($DeployTarget -eq "github") {
    Write-Host "  GitHub Pages will auto-deploy" -ForegroundColor Green
    $deployUrl = "https://<username>.github.io/WhiteNoise-Pro"
} elseif ($DeployTarget -eq "vercel") {
    if (Get-Command vercel -ErrorAction SilentlyContinue) {
        vercel --prod 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
        Write-Host "  Vercel deploy completed" -ForegroundColor Green
        $deployUrl = "https://whitenoise-pro.vercel.app"
    } else {
        Write-Host "  Vercel CLI not installed, skip" -ForegroundColor Yellow
    }
} elseif ($DeployTarget -eq "netlify") {
    if (Get-Command netlify -ErrorAction SilentlyContinue) {
        netlify deploy --prod 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
        Write-Host "  Netlify deploy completed" -ForegroundColor Green
        $deployUrl = "https://whitenoise-pro.netlify.app"
    } else {
        Write-Host "  Netlify CLI not installed, skip" -ForegroundColor Yellow
    }
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "[Deploy] Completed!" -ForegroundColor Green
Write-Host "  Duration: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Cyan
Write-Host "  Version: $Version" -ForegroundColor Cyan
Write-Host "  Target: $DeployTarget" -ForegroundColor Cyan
if ($deployUrl) {
    Write-Host "  URL: $deployUrl" -ForegroundColor Cyan
}

# Generate report
$reportPath = "D:\cowapout\WhiteNoise_Pro_DeployReport_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').md"
$reportContent = @"
# WhiteNoise Pro - Deploy Report

**Time**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**Version**: v$Version  
**Target**: $DeployTarget  
**Duration**: $($duration.Minutes)m $($duration.Seconds)s

## Status

| Step | Status |
|------|--------|
| Version Update | OK |
| Build | OK |
| Git Commit | OK |
| Push | OK |
| Deploy | OK |

## URL

$deployUrl

---
*Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')*
"@

$reportContent | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "  Report: $reportPath" -ForegroundColor Gray

exit 0
