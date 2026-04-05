import requests
import os

urls = {
    "rain.mp3": "https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-1239.mp3",
    "ocean.mp3": "https://assets.mixkit.co/sfx/preview/mixkit-waves-on-seashore-1191.mp3",
    "thunder.mp3": "https://assets.mixkit.co/sfx/preview/mixkit-thunder-in-the-distance-1353.mp3",
    "forest.mp3": "https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3",
    "cafe.mp3": "https://assets.mixkit.co/sfx/preview/mixkit-restaurant-crowd-talking-ambience-442.mp3",
    "wind.mp3": "https://assets.mixkit.co/sfx/preview/mixkit-wind-through-trees-1111.mp3",
    "fireplace.mp3": "https://assets.mixkit.co/sfx/preview/mixkit-camp-fire-crackling-1359.mp3"
}

output_dir = "C:/Users/PC/.copaw/workspaces/default/projects/WhiteNoise-PWA/sounds"
os.makedirs(output_dir, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "*/*",
    "Referer": "https://mixkit.co/"
}

print("="*60)
print("WhiteNoise Pro v3.1 - Audio Download")
print("="*60)

for filename, url in urls.items():
    print(f"\n[{filename}]")
    print(f"  URL: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=60, stream=True)
        response.raise_for_status()
        
        output_path = os.path.join(output_dir, filename)
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        size = os.path.getsize(output_path)
        print(f"  OK: {size/1024/1024:.2f} MB")
        
    except Exception as e:
        print(f"  NG: {e}")

print("\n" + "="*60)
print("Done!")
print("="*60)
