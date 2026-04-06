// WhiteNoise Pro - Audio Engine
// 真实的音频播放功能

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.audioElements = {};
        this.gainNodes = {};
        this.initialized = false;
    }

    // 初始化音频上下文
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('✅ Audio engine initialized');
        } catch (e) {
            console.error('❌ Audio context failed:', e);
        }
    }

    // 加载音频文件
    loadAudio(soundId, filePath) {
        return new Promise((resolve, reject) => {
            try {
                const audio = new Audio();
                audio.src = filePath;
                audio.loop = true;
                audio.preload = 'auto';
                
                audio.addEventListener('canplaythrough', () => {
                    console.log(`✅ Audio loaded: ${soundId}`);
                    resolve(audio);
                });
                
                audio.addEventListener('error', (e) => {
                    console.error(`❌ Audio load failed: ${soundId}`, e);
                    reject(e);
                });
                
                this.audioElements[soundId] = audio;
                
                // 创建音量控制节点
                if (this.audioContext) {
                    const source = this.audioContext.createMediaElementSource(audio);
                    const gainNode = this.audioContext.createGain();
                    source.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    gainNode.gain.value = 0.5; // 默认 50% 音量
                    this.gainNodes[soundId] = gainNode;
                }
                
                // 触发加载
                audio.load();
            } catch (e) {
                console.error(`❌ Failed to create audio for ${soundId}:`, e);
                reject(e);
            }
        });
    }

    // 播放音频
    play(soundId) {
        const audio = this.audioElements[soundId];
        if (!audio) {
            console.error(`❌ Audio not found: ${soundId}`);
            return false;
        }

        try {
            // 恢复音频上下文 (浏览器可能需要)
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            audio.play();
            console.log(`▶️ Playing: ${soundId}`);
            return true;
        } catch (e) {
            console.error(`❌ Play failed: ${soundId}`, e);
            return false;
        }
    }

    // 停止音频
    stop(soundId) {
        const audio = this.audioElements[soundId];
        if (!audio) return;

        try {
            audio.pause();
            audio.currentTime = 0;
            console.log(`⏹️ Stopped: ${soundId}`);
        } catch (e) {
            console.error(`❌ Stop failed: ${soundId}:`, e);
        }
    }

    // 设置音量
    setVolume(soundId, volume) {
        const gainNode = this.gainNodes[soundId];
        if (gainNode) {
            gainNode.gain.value = volume / 100;
            console.log(`🔊 Volume ${soundId}: ${volume}%`);
        }
    }

    // 停止所有音频
    stopAll() {
        Object.keys(this.audioElements).forEach(id => {
            this.stop(id);
        });
    }

    // 获取音频状态
    isPlaying(soundId) {
        const audio = this.audioElements[soundId];
        return audio && !audio.paused;
    }
}

// 创建全局音频引擎实例
window.audioEngine = new AudioEngine();
