import requests
import os

# MC2Method 音频下载链接
# 映射关系：rain, ocean, thunder, forest, cafe, wind, fireplace
AUDIO_MAP = {
    "rain.mp3": "download.php?file=42-Rain&length=10",  # Rain 2 (Popular)
    "ocean.mp3": "download.php?file=25-Ocean&length=10",  # Ocean 1 (Popular)
    "thunder.mp3": "download.php?file=24-Storm&length=10",  # Storm
    "forest.mp3": "download.php?file=08-Rain&length=10",  # Rain 6 (nature sounds)
    "cafe.mp3": "download.php?file=44-Rain&length=10",  # Rain 5 (Popular)
    "wind.mp3": "download.php?file=20-Fan&length=10",  # Fan 1 (white noise)
    "fireplace.mp3": "download.php?file=16-Dryer&length=10",  # Clothes dryer 1
}

BASE_URL = "https://mc2method.org/white-noise/"
OUTPUT_DIR = "C:/Users/PC/.copaw/workspaces/default/projects/WhiteNoise-PWA/sounds"

os.makedirs(OUTPUT_DIR, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "*/*",
    "Referer": BASE_URL
}

print("="*60)
print("WhiteNoise Pro v3.1 - MC2Method Audio Download")
print("="*60)

success = 0
for filename, path in AUDIO_MAP.items():
    url = BASE_URL + path
    print(f"\n[{filename}]")
    print(f"  URL: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=60, stream=True)
        response.raise_for_status()
        
        output_path = os.path.join(OUTPUT_DIR, filename)
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        size = os.path.getsize(output_path)
        print(f"  OK: {size/1024/1024:.2f} MB")
        success += 1
        
    except Exception as e:
        print(f"  NG: {e}")

print("\n" + "="*60)
print(f"Done: {success}/7 success")
print("="*60)
