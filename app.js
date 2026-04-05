/**
 * WhiteNoise Pro v3.0 - 音频管理器
 * 使用 Web Audio API 生成白噪音 + 外部音源
 */

class PWAAudioManager {
    constructor() {
        this.audioContext = null;
        this.audioElements = {};
        this.isPlaying = false;
        this.currentSounds = [];
        this.volumes = {};
        this.externalSources = {
            'rain': 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
            'ocean': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73b67.mp3',
            'thunder': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2e3f8e1e5e.mp3',
            'forest': 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3',
            'cafe': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c610232532.mp3',
            'wind': 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_d1718ab41b.mp3',
            'fireplace': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_43e9e8e7d0.mp3'
        };
        this.setupMediaSession();
    }

    /**
     * 初始化音频上下文
     */
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * 创建音频元素（使用外部音源）
     */
    createAudioElement(soundName, url) {
        const audio = document.createElement('audio');
        audio.crossOrigin = 'anonymous';
        audio.loop = true;
        audio.preload = 'auto';
        audio.setAttribute('webkit-playsinline', '');
        audio.setAttribute('playsinline', '');
        
        // 使用外部音源或本地音源
        const sourceUrl = this.externalSources[soundName] || url;
        audio.src = sourceUrl;
        
        audio.addEventListener('canplaythrough', () => {
            console.log(`[OK] ${soundName} 已加载`);
        });
        
        audio.addEventListener('error', (e) => {
            console.error(`[ERROR] ${soundName} 加载失败:`, e);
        });
        
        document.body.appendChild(audio);
        this.audioElements[soundName] = audio;
        this.volumes[soundName] = 0.5;
        return audio;
    }

    /**
     * 播放指定音效
     */
    playSound(soundName, volume = 0.5) {
        this.initAudioContext();
        
        const audio = this.audioElements[soundName];
        if (audio) {
            audio.volume = volume;
            this.volumes[soundName] = volume;
            
            audio.play()
                .then(() => {
                    console.log(`[OK] ${soundName} 播放成功`);
                })
                .catch((e) => {
                    console.error(`[ERROR] ${soundName} 播放失败:`, e.message);
                });
            
            if (!this.currentSounds.includes(soundName)) {
                this.currentSounds.push(soundName);
            }
            this.isPlaying = true;
            this.updateMediaSession();
        }
    }

    /**
     * 停止指定音效
     */
    stopSound(soundName) {
        const audio = this.audioElements[soundName];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            this.currentSounds = this.currentSounds.filter(name => name !== soundName);
            if (this.currentSounds.length === 0) {
                this.isPlaying = false;
            }
            this.updateMediaSession();
        }
    }

    /**
     * 停止所有音效
     */
    stopAll() {
        Object.values(this.audioElements).forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.currentSounds = [];
        this.isPlaying = false;
        this.updateMediaSession();
    }

    /**
     * 设置音量
     */
    setVolume(soundName, volume) {
        const audio = this.audioElements[soundName];
        if (audio) {
            audio.volume = Math.max(0, Math.min(1, volume));
            this.volumes[soundName] = audio.volume;
        }
    }

    /**
     * 获取当前音量
     */
    getVolume(soundName) {
        return this.volumes[soundName] || 0.5;
    }

    /**
     * 更新媒体会话状态
     */
    updateMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
        }
    }

    /**
     * 设置媒体会话
     */
    setupMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'WhiteNoise Pro',
                artist: '白噪音',
                album: '自然声音合集',
                artwork: [
                    { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => {
                this.currentSounds.forEach((sound) => {
                    this.playSound(sound, this.volumes[sound]);
                });
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                this.stopAll();
            });
        }
    }

    /**
     * 初始化所有音效
     */
    initializeSounds(soundNames) {
        soundNames.forEach((name) => {
            this.createAudioElement(name, `sounds/${name}.mp3`);
        });
        console.log('[OK] 音效初始化完成:', soundNames.length, '个音效');
    }
}

// 全局实例
const audioManager = new PWAAudioManager();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAAudioManager;
}
