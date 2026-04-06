# WhiteNoise Pro - 飞书通知脚本
# 功能：发送执行状态通知到飞书

param(
    [string]$WebhookUrl,
    [string]$Status = "success",  # success, failed, warning
    [hashtable]$StepResults,
    [string]$Duration,
    [string]$Version,
    [string]$DeployUrl
)

$ErrorActionPreference = "Stop"

# 构建通知内容
if ($Status -eq "success") {
    $title = "✅ WhiteNoise Pro 发布成功"
    $titleColor = "green"
    $emoji = "🎵"
} elseif ($Status -eq "failed") {
    $title = "❌ WhiteNoise Pro 发布失败"
    $titleColor = "red"
    $emoji = "⚠️"
} else {
    $title = "⚡ WhiteNoise Pro 发布警告"
    $titleColor = "yellow"
    $emoji = "⚙️"
}

# 构建步骤状态文本
$stepText = ""
foreach ($step in $StepResults.Keys) {
    $stepStatus = $StepResults[$step]
    if ($stepStatus -eq "Success") {
        $stepText += "✅ $step`n"
    } elseif ($stepStatus -eq "Failed") {
        $stepText += "❌ $step`n"
    } else {
        $stepText += "⚪ $step`n"
    }
}

# 构建飞书卡片消息
$message = @{
    msg_type = "interactive"
    card = @{
        header = @{
            title = @{
                tag = "plain_text"
                content = "$emoji $title"
            }
            template = $titleColor
        }
        elements = @(
            @{
                tag = "div"
                text = @{
                    tag = "lark_md"
                    content = "**执行时间**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n**总耗时**: $Duration`n**版本号**: $Version"
                }
            },
            @{
                tag = "hr"
            },
            @{
                tag = "div"
                text = @{
                    tag = "lark_md"
                    content = "**步骤执行结果**:`n$stepText"
                }
            }
        )
    }
}

# 添加部署链接 (如果成功)
if ($Status -eq "success" -and $DeployUrl) {
    $message.card.elements += @{
        tag = "action"
        actions = @(
            @{
                tag = "button"
                text = @{
                    tag = "plain_text"
                    content = "查看部署 🚀"
                }
                url = $DeployUrl
                type = "primary"
            }
        )
    }
}

# 发送通知
$jsonBody = $message | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $jsonBody -ContentType "application/json; charset=utf-8"

Write-Host "  ✓ 飞书通知已发送" -ForegroundColor Gray

exit 0
