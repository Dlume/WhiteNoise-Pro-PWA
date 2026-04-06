# WhiteNoise Pro - Auto Publish Main Script

param(
    [string]$Version = "auto",
    [string]$DeployTarget = "github",
    [switch]$SkipIcon,
    [switch]$SkipAudio,
    [switch]$SkipBuild,
    [switch]$DryRun,
    [string]$LogDir = "D:\cowapout\WhiteNoise-Pro\logs"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
}

$logFile = Join-Path $LogDir "publish_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').log"
Start-Transcript -Path $logFile -Append

$startTime = Get-Date
$projectRoot = "D:\cowapout\WhiteNoise-Pro"
$scriptDir = Join-Path $projectRoot "scripts"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WhiteNoise Pro Auto Publish" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Start: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "Version: $Version" -ForegroundColor Gray
Write-Host "Target: $DeployTarget" -ForegroundColor Gray
Write-Host ""

$overallStatus = "Success"
$stepResults = @{}

try {
    # Step 1: Icons
    if (-not $SkipIcon) {
        Write-Host "[1/3] Downloading icons..." -ForegroundColor Yellow
        $iconScript = Join-Path $scriptDir "download-icons.ps1"
        if (Test-Path $iconScript) {
            & $iconScript
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [OK] Icons completed" -ForegroundColor Green
                $stepResults["Icons"] = "Success"
            } else {
                Write-Host "  [FAIL] Icons failed" -ForegroundColor Red
                $stepResults["Icons"] = "Failed"
                $overallStatus = "Failed"
                throw "Icons download failed"
            }
        } else {
            Write-Host "  [SKIP] Icon script not found" -ForegroundColor Yellow
            $stepResults["Icons"] = "Skipped"
        }
    } else {
        Write-Host "[1/3] Skip icons" -ForegroundColor Gray
        $stepResults["Icons"] = "Skipped"
    }
    Write-Host ""
    
    # Step 2: Audio
    if (-not $SkipAudio) {
        Write-Host "[2/3] Downloading audio..." -ForegroundColor Yellow
        $audioScript = Join-Path $scriptDir "download-audio.ps1"
        if (Test-Path $audioScript) {
            & $audioScript
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [OK] Audio completed" -ForegroundColor Green
                $stepResults["Audio"] = "Success"
            } else {
                Write-Host "  [FAIL] Audio failed" -ForegroundColor Red
                $stepResults["Audio"] = "Failed"
                $overallStatus = "Failed"
                throw "Audio download failed"
            }
        } else {
            Write-Host "  [SKIP] Audio script not found" -ForegroundColor Yellow
            $stepResults["Audio"] = "Skipped"
        }
    } else {
        Write-Host "[2/3] Skip audio" -ForegroundColor Gray
        $stepResults["Audio"] = "Skipped"
    }
    Write-Host ""
    
    # Step 3: Deploy
    Write-Host "[3/3] Deploying..." -ForegroundColor Yellow
    $deployScript = Join-Path $scriptDir "deploy.ps1"
    if (Test-Path $deployScript) {
        & $deployScript -Version $Version -DeployTarget $DeployTarget -SkipBuild:$SkipBuild -DryRun:$DryRun
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Deploy completed" -ForegroundColor Green
            $stepResults["Deploy"] = "Success"
        } else {
            Write-Host "  [FAIL] Deploy failed" -ForegroundColor Red
            $stepResults["Deploy"] = "Failed"
            $overallStatus = "Failed"
            throw "Deploy failed"
        }
    } else {
        Write-Host "  [FAIL] Deploy script not found" -ForegroundColor Red
        $stepResults["Deploy"] = "Failed"
        $overallStatus = "Failed"
        throw "Deploy script not found"
    }
}
catch {
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    $overallStatus = "Failed"
}
finally {
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Publish Completed!" -ForegroundColor $(if ($overallStatus -eq "Success") { "Green" } else { "Red" })
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Duration: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Cyan
    Write-Host "Status: $overallStatus" -ForegroundColor $(if ($overallStatus -eq "Success") { "Green" } else { "Red" })
    Write-Host "Log: $logFile" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Step Results:" -ForegroundColor Cyan
    foreach ($step in $stepResults.Keys) {
        $status = $stepResults[$step]
        if ($status -eq "Success") {
            Write-Host "  [OK] $step" -ForegroundColor Green
        } elseif ($status -eq "Failed") {
            Write-Host "  [FAIL] $step" -ForegroundColor Red
        } else {
            Write-Host "  [SKIP] $step" -ForegroundColor Gray
        }
    }
    Write-Host ""
    
    # Generate report
    $reportPath = "D:\cowapout\WhiteNoise_Pro_ExecReport_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').md"
    $statusText = if ($overallStatus -eq "Success") { "Success" } else { "Failed" }
    
    $reportContent = @"
# WhiteNoise Pro - Execution Report

**Time**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**Status**: $statusText  
**Duration**: $($duration.Minutes)m $($duration.Seconds)s  
**Version**: $Version  
**Target**: $DeployTarget

## Steps

| Step | Status |
|------|--------|
"@
    
    foreach ($step in $stepResults.Keys) {
        $stepStatus = $stepResults[$step]
        $icon = if ($stepStatus -eq "Success") { "OK" } elseif ($stepStatus -eq "Failed") { "FAIL" } else { "SKIP" }
        $reportContent += "| $step | $icon |`n"
    }
    
    $reportContent += @"

## Stats

- Start: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
- End: $($endTime.ToString('yyyy-MM-dd HH:mm:ss'))
- Duration: $($duration.Minutes)m $($duration.Seconds)s
- Log: $logFile

---
*Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')*
"@

    $reportContent | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "Report: $reportPath" -ForegroundColor Cyan
}

Stop-Transcript

exit $(if ($overallStatus -eq "Success") { 0 } else { 1 })
