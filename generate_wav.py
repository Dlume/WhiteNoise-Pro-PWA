"""
WhiteNoise Pro v3.1 - 纯 Python 生成白噪音
使用标准库 wave 和 random，无需外部依赖
"""
import wave
import struct
import math
import random
import os

OUTPUT_DIR = "C:/Users/PC/.copaw/workspaces/default/projects/WhiteNoise-PWA/sounds"
SAMPLE_RATE = 44100
DURATION = 30  # 30 秒循环（减小文件大小）

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("="*60)
print("WhiteNoise Pro v3.1 - Pure Python Audio Generation")
print("="*60)

def save_wav(filename, samples, sample_rate):
    """保存为 WAV 文件"""
    output_path = os.path.join(OUTPUT_DIR, filename)
    
    with wave.open(output_path, 'w') as wav_file:
        wav_file.setnchannels(1)  # 单声道
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        for sample in samples:
            # 转换为 16-bit 整数
            value = int(sample * 32767)
            value = max(-32768, min(32767, value))
            wav_file.writeframes(struct.pack('<h', value))
    
    size = os.path.getsize(output_path)
    return size

def generate_white_noise(samples):
    """白噪音"""
    return [random.uniform(-1, 1) for _ in range(samples)]

def generate_pink_noise(samples):
    """粉红噪音（更自然）"""
    pink = []
    b = [0, 0, 0, 0, 0, 0, 0]
    
    for _ in range(samples):
        white = random.uniform(-1, 1)
        b[0] = 0.99886 * b[0] + white * 0.0555179
        b[1] = 0.99332 * b[1] + white * 0.0750759
        b[2] = 0.96900 * b[2] + white * 0.1538520
        b[3] = 0.86650 * b[3] + white * 0.3104856
        b[4] = 0.55000 * b[4] + white * 0.5329522
        b[5] = -0.7616 * b[5] - white * 0.0168980
        pink.append(b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + white * 0.5362)
        pink[-1] *= 0.11  # 归一化
    
    return pink

def generate_brown_noise(samples):
    """布朗噪音（更深沉）"""
    brown = []
    last = 0
    
    for _ in range(samples):
        white = random.uniform(-1, 1)
        last = (last + (0.02 * white)) / 1.02
        brown.append(last * 3.5)  # 补偿增益
    
    return brown

def generate_rain(samples):
    """雨声"""
    audio = generate_pink_noise(samples)
    
    # 低通滤波
    for i in range(1, len(audio)):
        audio[i] = 0.95 * audio[i] + 0.05 * audio[i-1]
    
    # 添加雨滴
    for i in range(0, len(audio), 100):
        if random.random() < 0.3:
            for j in range(min(50, len(audio) - i)):
                audio[i+j] += random.uniform(0, 0.3) * (1 - j/50)
    
    return audio

def generate_ocean(samples):
    """海浪声"""
    audio = generate_brown_noise(samples)
    
    # 波浪包络
    for i in range(len(audio)):
        t = i / SAMPLE_RATE
        wave = 0.5 + 0.5 * math.sin(2 * math.pi * 0.1 * t)
        audio[i] *= wave
    
    return audio

def generate_forest(samples):
    """森林声"""
    audio = generate_pink_noise(samples)
    
    # 低通滤波
    for i in range(1, len(audio)):
        audio[i] = 0.8 * audio[i] + 0.2 * audio[i-1]
    
    return audio

def generate_wind(samples):
    """风声"""
    audio = generate_white_noise(samples)
    
    # 调制
    for i in range(len(audio)):
        t = i / SAMPLE_RATE
        mod = 0.5 + 0.5 * math.sin(2 * math.pi * 0.05 * t)
        audio[i] *= mod
    
    # 滤波
    for i in range(1, len(audio)):
        audio[i] = 0.7 * audio[i] + 0.3 * audio[i-1]
    
    return audio

def generate_thunder(samples):
    """雷声"""
    audio = [0.0] * samples
    
    # 3-5 次雷声
    for _ in range(random.randint(3, 5)):
        start = random.randint(int(5 * SAMPLE_RATE), int(25 * SAMPLE_RATE))
        length = int(2 * SAMPLE_RATE)
        
        if start + length < samples:
            for i in range(length):
                if start + i < samples:
                    envelope = math.exp(-5 * i / length)
                    audio[start + i] += random.uniform(-1, 1) * envelope * 0.8
    
    return audio

def generate_cafe(samples):
    """咖啡厅声"""
    audio = generate_pink_noise(samples)
    
    # 带通滤波
    for i in range(1, len(audio)):
        audio[i] = 0.85 * audio[i] + 0.15 * audio[i-1]
    
    return audio

def generate_fireplace(samples):
    """篝火声"""
    audio = generate_pink_noise(samples)
    
    # 滤波
    for i in range(1, len(audio)):
        audio[i] = 0.7 * audio[i] + 0.3 * audio[i-1]
    
    # 噼啪声
    for _ in range(30):
        start = random.randint(0, samples - 1000)
        for i in range(min(1000, samples - start)):
            audio[start + i] += random.uniform(-0.3, 0.3) * math.exp(-10 * i / 1000)
    
    return audio

# 生成所有音效
sounds = {
    "rain.wav": generate_rain,
    "ocean.wav": generate_ocean,
    "thunder.wav": generate_thunder,
    "forest.wav": generate_forest,
    "cafe.wav": generate_cafe,
    "wind.wav": generate_wind,
    "fireplace.wav": generate_fireplace
}

success = 0
for filename, generator in sounds.items():
    print(f"\n[{filename}]")
    
    try:
        samples = int(DURATION * SAMPLE_RATE)
        audio = generator(samples)
        
        # 归一化
        max_val = max(abs(x) for x in audio)
        if max_val > 0:
            audio = [x / max_val * 0.9 for x in audio]
        
        size = save_wav(filename, audio, SAMPLE_RATE)
        print(f"  OK: {size/1024/1024:.2f} MB")
        
        success += 1
        
    except Exception as e:
        print(f"  NG: {e}")

print("\n" + "="*60)
print(f"Generated: {success}/7 files")
print(f"Location: {OUTPUT_DIR}")
print("="*60)
