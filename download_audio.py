"""
WhiteNoise Pro v3.1 - 音频素材采集和压缩脚本
下载高质量免费音频并压缩上传到 GitHub
"""
import os
import sys
import subprocess
import requests
from pathlib import Path

# 音频下载链接（免费可商用 - CC0/Pixabay/Mixkit）
AUDIO_SOURCES = {
    # 雨声 - 高质量自然录音
    "rain.mp3": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    
    # 海浪 - 海滩波浪声
    "ocean.mp3": "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73b67.mp3",
    
    # 雷声 - 暴风雨雷电
    "thunder.mp3": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_2e3f8e1e5e.mp3",
    
    # 森林 - 鸟鸣和树叶声
    "forest.mp3": "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3",
    
    # 咖啡厅 - 环境人声
    "cafe.mp3": "https://cdn.pixabay.com/download/audio/2022/03/24/audio_c610232532.mp3",
    
    # 风声 - 自然风
    "wind.mp3": "https://cdn.pixabay.com/download/audio/2022/03/24/audio_d1718ab41b.mp3",
    
    # 篝火 - 燃烧声
    "fireplace.mp3": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_43e9e8e7d0.mp3"
}

BASE_PATH = Path("C:/Users/PC/.copaw/workspaces/default/projects/WhiteNoise-PWA")
SOUNDS_PATH = BASE_PATH / "sounds"
TEMP_PATH = BASE_PATH / "temp_audio"

def download_audio(url, output_path):
    """下载音频文件"""
    print(f"  下载：{url}")
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=60)
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        size = os.path.getsize(output_path)
        print(f"  OK 下载完成：{size/1024/1024:.2f} MB")
        return True
    except Exception as e:
        print(f"  NG 下载失败：{e}")
        return False

def compress_audio(input_path, output_path, target_size_mb=8):
    """使用 ffmpeg 压缩音频"""
    print(f"  压缩目标：{target_size_mb} MB")
    
    # ffmpeg 压缩命令
    cmd = [
        "ffmpeg",
        "-i", str(input_path),
        "-b:a", "128k",  # 比特率 128kbps
        "-ar", "44100",  # 采样率 44.1kHz
        "-ac", "2",      # 立体声
        "-y",           # 覆盖输出
        str(output_path)
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if os.path.exists(output_path):
            size = os.path.getsize(output_path)
            print(f"  OK 压缩完成：{size/1024/1024:.2f} MB")
            return True
        else:
            print(f"  NG 压缩失败：{result.stderr}")
            return False
    except Exception as e:
        print(f"  NG 压缩错误：{e}")
        return False

def check_ffmpeg():
    """检查 ffmpeg 是否安装"""
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    except:
        return False

def main():
    print("="*60)
    print("WhiteNoise Pro v3.1 - 音频素材采集和压缩")
    print("="*60)
    
    # 检查 ffmpeg
    has_ffmpeg = check_ffmpeg()
    print(f"\nFFmpeg 状态：{'OK 已安装' if has_ffmpeg else 'NG 未安装'}")
    
    # 创建目录
    SOUNDS_PATH.mkdir(parents=True, exist_ok=True)
    TEMP_PATH.mkdir(parents=True, exist_ok=True)
    
    # 下载和压缩音频
    results = {}
    for filename, url in AUDIO_SOURCES.items():
        print(f"\n[{filename}]")
        
        temp_file = TEMP_PATH / f"temp_{filename}"
        output_file = SOUNDS_PATH / filename
        
        # 下载
        if download_audio(url, temp_file):
            input_size = os.path.getsize(temp_file)
            
            # 如果文件太大则压缩
            if input_size > 10 * 1024 * 1024 and has_ffmpeg:  # > 10MB
                print(f"  原始大小：{input_size/1024/1024:.2f} MB (需要压缩)")
                if compress_audio(temp_file, output_file):
                    results[filename] = True
                else:
                    # 压缩失败，使用原文件
                    temp_file.rename(output_file)
                    results[filename] = True
            else:
                print(f"  原始大小：{input_size/1024/1024:.2f} MB (无需压缩)")
                if output_file.exists():
                    output_file.unlink()
                temp_file.rename(output_file)
                results[filename] = True
        else:
            results[filename] = False
    
    # 清理临时文件
    if TEMP_PATH.exists():
        for f in TEMP_PATH.glob("*"):
            f.unlink()
        TEMP_PATH.rmdir()
    
    # 统计结果
    print("\n" + "="*60)
    print("采集结果统计")
    print("="*60)
    
    success = sum(results.values())
    total = len(results)
    
    for filename, ok in results.items():
        status = "OK" if ok else "NG"
        size = "N/A"
        if ok:
            file_path = SOUNDS_PATH / filename
            if file_path.exists():
                size = f"{os.path.getsize(file_path)/1024/1024:.2f} MB"
        print(f"  {status} {filename}: {size}")
    
    print(f"\n总计：{success}/{total} 成功")
    print("="*60)
    
    return success == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
