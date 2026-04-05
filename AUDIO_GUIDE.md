# WhiteNoise Pro v3.0 - 音频文件获取指南

**问题**: 原始音频文件已损坏 (仅 255 字节)  
**解决**: 需要下载真实音频文件

---

## 🎵 音频文件清单

需要以下 7 个 MP3 文件，每个文件应大于 1MB：

| 文件名 | 音效 | 建议大小 |
|--------|------|----------|
| rain.mp3 | 雨声 | 2-5MB |
| ocean.mp3 | 海浪 | 2-5MB |
| thunder.mp3 | 雷声 | 2-5MB |
| forest.mp3 | 森林 | 2-5MB |
| cafe.mp3 | 咖啡厅 | 2-5MB |
| wind.mp3 | 风声 | 2-5MB |
| fireplace.mp3 | 篝火 | 2-5MB |

---

## 📥 下载方案

### 方案 1: 从开源项目下载 (推荐)

**moodist 项目** (3.4k stars):
```bash
cd C:\Users\PC\.copaw\workspaces\default\projects\WhiteNoise-PWA\sounds

# 使用 curl 下载
curl -L "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/rain.mp3" -o rain.mp3
curl -L "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/ocean.mp3" -o ocean.mp3
curl -L "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/forest.mp3" -o forest.mp3
curl -L "https://raw.githubusercontent.com/remvze/moodist/main/public/sounds/cafe.mp3" -o cafe.mp3
```

### 方案 2: 免费音效网站

1. **Freesound.org**
   - https://freesound.org/search/?q=rain+sound
   - 需要注册，免费使用

2. **ZapSplat**
   - https://www.zapsplat.com/
   - 免费高质量音效

3. **Mixkit**
   - https://mixkit.co/free-sound-effects/
   - 无需注册，直接下载

### 方案 3: 使用现有文件

如果系统中有其他白噪音项目，可复制音频文件：
```bash
# 搜索系统中的 MP3 文件
dir /s /b D:\*.mp3 | findstr /i "rain ocean forest"
```

---

## ✅ 验证文件

下载后验证文件大小：
```bash
cd C:\Users\PC\.copaw\workspaces\default\projects\WhiteNoise-PWA\sounds
dir *.mp3
```

每个文件应该：
- ✅ 大小 > 1MB
- ✅ 可以用播放器正常播放
- ✅ 时长 > 30 秒 (循环使用)

---

## 🚀 部署更新

下载完成后重新部署：
```bash
cd C:\Users\PC\.copaw\workspaces\default\projects\WhiteNoise-PWA

# 使用 PowerShell 脚本上传
powershell -ExecutionPolicy Bypass -File upload-resources.ps1
```

---

## 📝 当前状态

- ✅ 界面已优化 (v3.0 暗色主题)
- ✅ 代码已更新
- ❌ 音频文件待下载
- ⏸️ 部署暂停 (等待音频文件)

---

*最后更新*: 2026-04-05 15:12
