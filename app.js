/**
 * WhiteNoise Pro - 音频管理器
 * 支持 iOS 后台播放 + 媒体会话 API
 * @version 2.0 - 重构版
 */

class PWAAudioManager {
    constructor() {
        this.audioElements = {};
        this.isPlaying = false;
        this.currentSounds = [];
        this.volumes = {};
        this.setupMediaSession();
    }

    /**
     * 创建音频元素
     * @param {string} soundName - 音效名称
     * @param {string} url - 音频文件 URL
     */
    createAudioElement(soundName, url) {
        const audio = document.createElement('audio');
        audio.src = url;
        audio.loop = true;
        audio.preload = 'auto';
        audio.setAttribute('webkit-playsinline', '');
        audio.setAttribute('playsinline', '');
        audio.crossOrigin = 'anonymous';
        document.body.appendChild(audio);
        this.audioElements[soundName] = audio;
        this.volumes[soundName] = 0.5;
        return audio;
    }

    /**
     * 播放指定音效
     * @param {string} soundName - 音效名称
     * @param {number} volume - 音量 (0-1)
     */
    playSound(soundName, volume = 0.5) {
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
     * @param {string} soundName - 音效名称
     */
    stopSound(soundName) {
        const audio = this.audioElements[soundName];
        if (audio) {
            audio.pause();
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
        });
        this.currentSounds = [];
        this.isPlaying = false;
        this.updateMediaSession();
    }

    /**
     * 设置音量
     * @param {string} soundName - 音效名称
     * @param {number} volume - 音量 (0-1)
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
     * @param {string} soundName - 音效名称
     * @returns {number} 音量值
     */
    getVolume(soundName) {
        return this.volumes[soundName] || 0.5;
    }

    /**
     * 更新媒体会话状态
     */
    updateMediaSession() {
        if ('mediaSession' in navigator) {
            if (this.isPlaying) {
                navigator.mediaSession.playbackState = 'playing';
            } else {
                navigator.mediaSession.playbackState = 'paused';
            }
        }
    }

    /**
     * 设置媒体会话 (iOS 后台播放关键)
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

            // 播放控制
            navigator.mediaSession.setActionHandler('play', () => {
                this.currentSounds.forEach((sound) => {
                    this.playSound(sound, this.volumes[sound]);
                });
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                this.stopAll();
            });

            navigator.mediaSession.setActionHandler('previoustrack', null);
            navigator.mediaSession.setActionHandler('nexttrack', null);
        }
    }

    /**
     * 初始化所有音效
     * @param {Array<string>} soundNames - 音效名称列表
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

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAAudioManager;
}
