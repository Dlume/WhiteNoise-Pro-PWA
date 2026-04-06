# WhiteNoise Pro - 自动化发布项目

一键执行完整发布流程：图标生成 → 音频下载 → 部署上线

## 🚀 快速开始

### 首次使用

1. **克隆/创建项目**
```bash
cd D:\cowapout\WhiteNoise-Pro
```

2. **配置环境变量**
```bash
# 复制配置模板
copy .env.example .env

# 编辑 .env 文件，填写实际的 API 密钥和配置
```

3. **安装依赖 (可选)**
```bash
# 如使用 Vercel/Netlify 部署
npm install -g vercel
npm install -g netlify-cli
```

### 执行发布

**一键执行全流程**:
```powershell
# 进入项目目录
cd D:\cowapout\WhiteNoise-Pro

# 执行自动发布
.\auto-publish.ps1
```

**自定义参数**:
```powershell
# 指定版本号
.\auto-publish.ps1 -Version "2.0.0"

# 指定部署目标
.\auto-publish.ps1 -DeployTarget "vercel"

# 跳过某些步骤
.\auto-publish.ps1 -SkipIcon -SkipAudio

# 仅测试，不实际部署
.\auto-publish.ps1 -DryRun
```

## 📋 流程说明

### Step 1: 图标处理 (2 分钟)
- 从 CDN 下载图标 (SVG 格式)
- 自动调整尺寸和格式
- 生成图标清单

### Step 2: 音频下载 (10-15 分钟)
- 批量下载白噪音音频
- 分类整理 (雨声、海浪、自然、城市等)
- 格式转换和标准化
- 生成音频清单

### Step 3: 部署上线 (5 分钟)
- 自动递增版本号
- 构建项目
- Git 提交和推送
- 触发 CI/CD 部署
- 健康检查

**总耗时**: 约 17-22 分钟

## ⏰ 定时执行

### 创建 Cron 任务

已配置定时任务，每周一凌晨 2 点自动执行：

```json
{
  "name": "WhiteNoise Pro 自动发布",
  "schedule": {
    "kind": "cron",
    "expr": "0 2 * * 1",
    "tz": "Asia/Shanghai"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "执行 WhiteNoise Pro 自动化发布流程"
  },
  "sessionTarget": "isolated",
  "delivery": {
    "mode": "announce",
    "channel": "feishu"
  }
}
```

### 手动触发

```powershell
# 立即执行一次
copaw cron run --job-id "whitenoise-auto-publish"
```

## 📊 输出文件

### 执行报告
- 位置：`D:\cowapout\WhiteNoise_Pro_执行报告_YYYY-MM-DD_HHmmss.md`
- 包含：执行时间、各步骤状态、统计信息

### 部署报告
- 位置：`D:\cowapout\WhiteNoise_Pro_部署报告_YYYY-MM-DD_HHmmss.md`
- 包含：版本号、部署链接、Git 提交信息

### 日志文件
- 位置：`D:\cowapout\WhiteNoise-Pro\logs\publish_YYYY-MM-DD_HHmmss.log`
- 包含：详细执行日志

## 🎯 项目结构

```
WhiteNoise-Pro/
├── auto-publish.ps1          # 主流程脚本
├── scripts/
│   ├── download-icons.ps1    # 图标下载
│   ├── download-audio.ps1    # 音频下载
│   └── deploy.ps1            # 部署上线
├── assets/
│   ├── icons/                # 图标文件
│   └── audio/                # 音频文件
├── logs/                     # 日志目录
├── .env                      # 环境配置
└── .env.example              # 配置模板
```

## ⚙️ 配置说明

编辑 `.env` 文件配置以下参数：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `ICON_CDN_URL` | 图标 CDN 地址 | jsDelivr |
| `AUDIO_API_KEY` | 音频 API 密钥 | - |
| `DEPLOY_TARGET` | 部署目标 | github |
| `FEISHU_WEBHOOK_URL` | 飞书通知 Webhook | - |
| `ENABLE_NOTIFICATION` | 启用通知 | true |

## 🔧 故障排查

### 常见问题

**Q: 图标下载失败**
- 检查网络连接
- 验证 CDN URL 是否可访问
- 切换到备用 CDN

**Q: 音频下载超时**
- 增加 `AUDIO_DOWNLOAD_TIMEOUT` 值
- 检查音频 API 密钥是否有效
- 使用本地备份

**Q: Git 推送失败**
- 检查 `GITHUB_TOKEN` 是否有效
- 验证 Git 配置
- 确认远程仓库权限

### 查看日志

```powershell
# 查看最新日志
Get-Content D:\cowapout\WhiteNoise-Pro\logs\publish_*.log -Tail 50

# 查看执行报告
Get-Content D:\cowapout\WhiteNoise_Pro_执行报告_*.md
```

## 📈 监控和通知

### 通知内容

执行完成后自动发送飞书通知：

```
🎵 WhiteNoise Pro 发布报告

执行时间：2026-04-06 02:00
总耗时：18 分钟 32 秒

✅ 步骤 1/3: 图标处理 - 成功
✅ 步骤 2/3: 音频下载 - 成功 (下载 24 个文件)
✅ 步骤 3/3: 部署上线 - 成功

部署链接：https://whitenoise-pro.vercel.app
版本号：v4.1.0
```

### 告警规则

- 连续 2 次失败 → 发送告警
- 执行时间超过 30 分钟 → 发送告警
- 音频文件缺失超过 10% → 发送告警

## 📝 版本历史

- **v1.0** (2026-04-06) - 初始版本
  - ✅ 图标自动下载
  - ✅ 音频批量下载
  - ✅ 一键部署上线
  - ✅ 定时任务支持
  - ✅ 飞书通知集成

---

**项目地址**: https://github.com/Dlume/WhiteNoise-Pro-PWA  
**文档**: [WhiteNoise_Pro_自动化发布流程设计.md](./WhiteNoise_Pro_自动化发布流程设计.md)  
**维护者**: LobsterAI
