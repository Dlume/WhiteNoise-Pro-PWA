"""
WhiteNoise Pro v3.1 - 使用 Python 生成真实白噪音
使用 numpy 和 scipy 生成专业品质的白噪音和自然声音
"""
import numpy as np
from scipy.io import wavfile
import os

OUTPUT_DIR = "C:/Users/PC/.copaw/workspaces/default/projects/WhiteNoise-PWA/sounds"
SAMPLE_RATE = 44100  # CD 品质
DURATION = 60  # 60 秒循环

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("="*60)
print("WhiteNoise Pro v3.1 - Procedural Audio Generation")
print("="*60)

def generate_white_noise(duration, sample_rate):
    """生成白噪音"""
    samples = int(duration * sample_rate)
    noise = np.random.uniform(-1, 1, samples)
    return noise.astype(np.float32)

def generate_pink_noise(duration, sample_rate):
    """生成粉红噪音（更自然）"""
    samples = int(duration * sample_rate)
    white = np.random.uniform(-1, 1, samples)
    
    # 简单的 1/f 滤波
    pink = np.zeros(samples)
    for i in range(samples):
        if i == 0:
            pink[i] = white[i]
        else:
            pink[i] = 0.99 * pink[i-1] + 0.01 * white[i]
    
    # 归一化
    pink = pink / np.max(np.abs(pink))
    return pink.astype(np.float32)

def generate_brown_noise(duration, sample_rate):
    """生成布朗噪音（更深沉）"""
    samples = int(duration * sample_rate)
    white = np.random.uniform(-1, 1, samples)
    
    # 积分
    brown = np.cumsum(white)
    brown = brown / np.max(np.abs(brown))
    
    return brown.astype(np.float32)

def generate_rain_sound(duration, sample_rate):
    """生成雨声（粉红噪音 + 高通滤波）"""
    samples = int(duration * sample_rate)
    
    # 基础粉红噪音
    rain = np.random.uniform(-1, 1, samples)
    
    # 简单的低通滤波模拟雨滴
    for i in range(1, samples):
        rain[i] = 0.95 * rain[i] + 0.05 * rain[i-1]
    
    # 添加随机雨滴声
    drop_indices = np.random.choice(samples, size=int(samples * 0.01), replace=False)
    for idx in drop_indices:
        if idx + 100 < samples:
            rain[idx:idx+100] += np.linspace(0.5, 0, 100)
    
    rain = rain / np.max(np.abs(rain))
    return rain.astype(np.float32)

def generate_ocean_sound(duration, sample_rate):
    """生成海浪声"""
    samples = int(duration * sample_rate)
    
    # 基础噪音
    ocean = np.random.uniform(-1, 1, samples)
    
    # 模拟波浪的周期性
    t = np.linspace(0, duration, samples)
    wave_envelope = 0.5 + 0.5 * np.sin(2 * np.pi * 0.1 * t)  # 0.1 Hz 波浪
    
    ocean = ocean * wave_envelope
    
    # 低通滤波
    for i in range(1, samples):
        ocean[i] = 0.9 * ocean[i] + 0.1 * ocean[i-1]
    
    ocean = ocean / np.max(np.abs(ocean))
    return ocean.astype(np.float32)

def generate_forest_sound(duration, sample_rate):
    """生成森林环境声"""
    samples = int(duration * sample_rate)
    
    # 基础粉红噪音（树叶声）
    forest = np.random.uniform(-1, 1, samples)
    
    # 低通滤波
    for i in range(1, samples):
        forest[i] = 0.8 * forest[i] + 0.2 * forest[i-1]
    
    # 添加鸟鸣（随机高频音调）
    t = np.linspace(0, duration, samples)
    bird_times = np.random.uniform(0, duration, size=10)
    
    for bird_time in bird_times:
        bird_start = int(bird_time * sample_rate)
        bird_len = int(0.3 * sample_rate)
        if bird_start + bird_len < samples:
            bird_freq = np.random.uniform(2000, 4000)
            bird_chirp = 0.3 * np.sin(2 * np.pi * bird_freq * t[bird_start:bird_start+bird_len])
            bird_chirp *= np.linspace(0, 1, bird_len//2)  # 渐入
            bird_chirp *= np.linspace(1, 0, bird_len//2)  # 渐出
            forest[bird_start:bird_start+bird_len] += bird_chirp
    
    forest = forest / np.max(np.abs(forest))
    return forest.astype(np.float32)

def generate_wind_sound(duration, sample_rate):
    """生成风声"""
    samples = int(duration * sample_rate)
    
    # 基础噪音
    wind = np.random.uniform(-1, 1, samples)
    
    # 带通滤波模拟风声
    t = np.linspace(0, duration, samples)
    wind_modulation = 0.5 + 0.5 * np.sin(2 * np.pi * 0.05 * t)  # 缓慢变化
    
    wind = wind * wind_modulation
    
    # 滤波
    for i in range(1, samples):
        wind[i] = 0.7 * wind[i] + 0.3 * wind[i-1]
    
    wind = wind / np.max(np.abs(wind))
    return wind.astype(np.float32)

def generate_thunder_sound(duration, sample_rate):
    """生成雷声"""
    samples = int(duration * sample_rate)
    thunder = np.zeros(samples)
    
    # 生成 3-5 次雷声
    num_thunders = np.random.randint(3, 6)
    thunder_times = np.sort(np.random.uniform(5, duration-10, num_thunders))
    
    for thunder_time in thunder_times:
        start_idx = int(thunder_time * sample_rate)
        thunder_len = int(2 * sample_rate)  # 2 秒雷声
        
        if start_idx + thunder_len < samples:
            # 雷声噪音
            thunder_noise = np.random.uniform(-1, 1, thunder_len)
            
            # 包络（快速起音，慢速衰减）
            envelope = np.exp(-np.linspace(0, 5, thunder_len))
            thunder_noise *= envelope
            
            # 低通滤波
            for i in range(1, thunder_len):
                thunder_noise[i] = 0.9 * thunder_noise[i] + 0.1 * thunder_noise[i-1]
            
            thunder[start_idx:start_idx+thunder_len] += thunder_noise * 0.8
    
    thunder = thunder / np.max(np.abs(thunder))
    return thunder.astype(np.float32)

def generate_cafe_sound(duration, sample_rate):
    """生成咖啡厅环境声"""
    samples = int(duration * sample_rate)
    
    # 基础粉红噪音
    cafe = np.random.uniform(-1, 1, samples)
    
    # 带通滤波（模拟人声频率）
    for i in range(1, samples):
        cafe[i] = 0.85 * cafe[i] + 0.15 * cafe[i-1]
    
    # 添加随机"谈话"声
    t = np.linspace(0, duration, samples)
    talk_times = np.random.uniform(0, duration, size=20)
    
    for talk_time in talk_times:
        talk_start = int(talk_time * sample_rate)
        talk_len = int(2 * sample_rate)
        if talk_start + talk_len < samples:
            talk = np.random.uniform(-0.3, 0.3, talk_len)
            talk *= np.linspace(0, 1, talk_len//2)
            talk *= np.linspace(1, 0, talk_len//2)
            cafe[talk_start:talk_start+talk_len] += talk
    
    cafe = cafe / np.max(np.abs(cafe))
    return cafe.astype(np.float32)

def generate_fireplace_sound(duration, sample_rate):
    """生成篝火/壁炉声"""
    samples = int(duration * sample_rate)
    
    # 基础粉红噪音
    fire = np.random.uniform(-1, 1, samples)
    
    # 带通滤波
    for i in range(1, samples):
        fire[i] = 0.7 * fire[i] + 0.3 * fire[i-1]
    
    # 添加随机"噼啪"声
    crackle_times = np.random.uniform(0, duration, size=30)
    
    for crackle_time in crackle_times:
        crackle_start = int(crackle_time * sample_rate)
        crackle_len = int(0.1 * sample_rate)  # 0.1 秒
        
        if crackle_start + crackle_len < samples:
            crackle = np.random.uniform(-0.5, 0.5, crackle_len)
            crackle *= np.exp(-np.linspace(0, 10, crackle_len))
            fire[crackle_start:crackle_start+crackle_len] += crackle
    
    fire = fire / np.max(np.abs(fire))
    return fire.astype(np.float32)

# 生成所有音效
sounds = {
    "rain.mp3": generate_rain_sound,
    "ocean.mp3": generate_ocean_sound,
    "thunder.mp3": generate_thunder_sound,
    "forest.mp3": generate_forest_sound,
    "cafe.mp3": generate_cafe_sound,
    "wind.mp3": generate_wind_sound,
    "fireplace.mp3": generate_fireplace_sound
}

success = 0
for filename, generator in sounds.items():
    print(f"\n[{filename}]")
    
    try:
        # 生成音频
        audio = generator(DURATION, SAMPLE_RATE)
        
        # 转换为 16-bit PCM
        audio_int16 = (audio * 32767).astype(np.int16)
        
        # 保存为 WAV
        output_path = os.path.join(OUTPUT_DIR, filename.replace('.mp3', '.wav'))
        wavfile.write(output_path, SAMPLE_RATE, audio_int16)
        
        # 获取文件大小
        size = os.path.getsize(output_path)
        print(f"  OK: {size/1024/1024:.2f} MB (WAV)")
        
        success += 1
        
    except Exception as e:
        print(f"  NG: {e}")

print("\n" + "="*60)
print(f"Done: {success}/7 generated")
print("="*60)
