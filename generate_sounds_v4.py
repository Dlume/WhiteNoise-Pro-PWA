#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
WhiteNoise Pro v4.0 - Audio Generator
Generate 8 new procedural audio sounds
"""

import wave
import struct
import math
import os
import random

SAMPLE_RATE = 44100
DURATION = 60  # 60 seconds (reduced for faster generation)
OUTPUT_DIR = 'audio'

def generate_white_noise(samples):
    """Generate white noise"""
    return [random.uniform(-1, 1) for _ in range(samples)]

def generate_pink_noise(samples):
    """Generate pink noise (1/f noise)"""
    # Voss-McCartney algorithm
    b = [0] * 16
    for i in range(samples):
        white = random.uniform(-1, 1)
        b[0] = white
        b[1] = b[1] * 0.5 + white * 0.5
        b[2] = b[2] * 0.75 + white * 0.25
        b[3] = b[3] * 0.875 + white * 0.125
        yield sum(b) / 4

def generate_brown_noise(samples):
    """Generate brown noise (1/f² noise)"""
    last = 0
    for i in range(samples):
        white = random.uniform(-1, 1)
        last = (last + white) / 2
        # Clip to prevent drift
        last = max(-1, min(1, last))
        yield last * 3.5

def generate_stream_sound(samples):
    """Generate flowing stream sound"""
    audio = []
    t = 0
    
    for i in range(samples):
        # Base flow (pink noise)
        flow = random.uniform(-0.3, 0.3)
        
        # Add some variation
        variation = math.sin(t * 0.01) * 0.1
        variation += math.sin(t * 0.03) * 0.05
        
        # Add occasional splashes
        if random.random() < 0.001:
            splash = random.uniform(-0.5, 0.5) * math.exp(-random.uniform(0, 10))
        else:
            splash = 0
        
        sample = flow + variation + splash
        audio.append(sample)
        t += 1
    
    return audio

def generate_birds_sound(samples):
    """Generate birdsong"""
    audio = []
    t = 0
    sample_rate = SAMPLE_RATE
    
    for i in range(samples):
        # Background ambience
        ambience = random.uniform(-0.05, 0.05)
        
        # Bird chirps (random intervals)
        chirp = 0
        if random.random() < 0.002:  # Chirp probability
            chirp_duration = random.randint(100, 500)
            chirp_freq = random.uniform(2000, 4000)
            
            for j in range(min(chirp_duration, samples - i)):
                if i + j < samples:
                    envelope = math.sin(math.pi * j / chirp_duration) ** 2
                    chirp_sample = envelope * math.sin(2 * math.pi * chirp_freq * j / sample_rate)
                    chirp_sample *= random.uniform(0.3, 0.7)
                    if i + j < len(audio):
                        audio[i + j] += chirp_sample * 0.5
                    else:
                        audio.append(chirp_sample * 0.5)
        
        sample = ambience
        audio.append(sample if len(audio) <= i else audio[i])
        t += 1
    
    return audio[:samples]

def generate_night_sound(samples):
    """Generate night ambience (crickets, etc.)"""
    audio = []
    t = 0
    
    for i in range(samples):
        # Base night ambience
        base = random.uniform(-0.1, 0.1)
        
        # Cricket sounds (periodic)
        cricket = 0
        cricket_period = 2000  # samples
        phase = t % cricket_period
        
        if 0 < phase < 500:  # Cricket chirp
            cricket = math.sin(2 * math.pi * 3000 * phase / SAMPLE_RATE) * 0.2
            cricket *= math.sin(math.pi * phase / 500)  # Envelope
        
        # Occasional owl hoot
        hoot = 0
        if random.random() < 0.0001:
            hoot_duration = 1000
            for j in range(hoot_duration):
                if i + j < samples:
                    hoot_sample = math.sin(2 * math.pi * 500 * j / SAMPLE_RATE) * 0.3
                    hoot_sample *= math.sin(math.pi * j / hoot_duration)
                    audio.append(hoot_sample)
        
        sample = base + cricket
        audio.append(sample)
        t += 1
    
    return audio

def generate_meditation_bowl(samples):
    """Generate meditation singing bowl"""
    audio = []
    t = 0
    
    # Fundamental frequency (singing bowl)
    freq = 432  # Hz
    
    for i in range(samples):
        # Main tone
        tone = math.sin(2 * math.pi * freq * t / SAMPLE_RATE)
        
        # Harmonics
        tone += math.sin(2 * math.pi * freq * 2 * t / SAMPLE_RATE) * 0.5
        tone += math.sin(2 * math.pi * freq * 3 * t / SAMPLE_RATE) * 0.3
        
        # Slow amplitude modulation (vibrato effect)
        modulation = 1 + 0.1 * math.sin(2 * math.pi * 5 * t / SAMPLE_RATE)
        
        # Very slow fade
        envelope = 1.0
        
        sample = tone * modulation * envelope * 0.3
        audio.append(sample)
        t += 1
    
    return audio

def generate_clouds_sound(samples):
    """Generate ethereal cloud sound"""
    audio = []
    t = 0
    
    for i in range(samples):
        # Multiple sine waves with slow frequency modulation
        freq1 = 200 + 50 * math.sin(2 * math.pi * 0.1 * t / SAMPLE_RATE)
        freq2 = 300 + 80 * math.sin(2 * math.pi * 0.15 * t / SAMPLE_RATE)
        freq3 = 500 + 100 * math.sin(2 * math.pi * 0.2 * t / SAMPLE_RATE)
        
        # Mix with soft noise
        noise = random.uniform(-0.1, 0.1)
        
        sample = (
            math.sin(2 * math.pi * freq1 * t / SAMPLE_RATE) * 0.2 +
            math.sin(2 * math.pi * freq2 * t / SAMPLE_RATE) * 0.15 +
            math.sin(2 * math.pi * freq3 * t / SAMPLE_RATE) * 0.1 +
            noise
        )
        
        audio.append(sample)
        t += 1
    
    return audio

def save_audio(samples, filename):
    """Save audio samples to WAV file"""
    output_path = os.path.join(OUTPUT_DIR, filename)
    
    with wave.open(output_path, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(SAMPLE_RATE)
        
        for sample in samples:
            # Clip to prevent overflow
            sample = max(-1, min(1, sample))
            # Convert to 16-bit integer
            packed = struct.pack('h', int(sample * 32767))
            wav_file.writeframes(packed)
    
    print(f"Generated: {output_path}")

def main():
    """Generate all new sounds"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    samples = SAMPLE_RATE * DURATION
    
    print("Generating WhiteNoise Pro v4.0 sounds...")
    print(f"Sample rate: {SAMPLE_RATE} Hz")
    print(f"Duration: {DURATION} seconds")
    print(f"Samples: {samples:,}")
    print()
    
    # Generate sounds
    sounds = [
        ('stream.wav', 'Stream', generate_stream_sound),
        ('birds.wav', 'Birds', generate_birds_sound),
        ('night.wav', 'Night', generate_night_sound),
        ('meditation.wav', 'Meditation', generate_meditation_bowl),
        ('white-noise.wav', 'White Noise', generate_white_noise),
        ('pink-noise.wav', 'Pink Noise', generate_pink_noise),
        ('brown-noise.wav', 'Brown Noise', generate_brown_noise),
        ('clouds.wav', 'Clouds', generate_clouds_sound)
    ]
    
    for filename, name, generator in sounds:
        print(f"Generating {name}...")
        
        # Generate audio
        if generator == generate_pink_noise or generator == generate_brown_noise:
            audio = list(generator(samples))
        else:
            audio = generator(samples)
        
        # Save to WAV
        save_audio(audio, filename)
    
    print()
    print("All sounds generated successfully!")
    print()
    print("Files saved to audio/ directory")

if __name__ == '__main__':
    main()
