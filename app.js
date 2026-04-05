/**
 * WhiteNoise Pro v3.2 - Audio Manager
 * High-quality procedural audio playback
 */

class PWAAudioManager {
    constructor() {
        this.audioContext = null;
        this.audioElements = {};
        this.isPlaying = false;
        this.currentSounds = [];
        this.volumes = {};
        this.externalSources = {
            'rain': 'sounds/rain.wav',
            'ocean': 'sounds/ocean.wav',
            'thunder': 'sounds/thunder.wav',
            'forest': 'sounds/forest.wav',
            'cafe': 'sounds/cafe.wav',
            'wind': 'sounds/wind.wav',
            'fireplace': 'sounds/fireplace.wav'
        };
        this.setupMediaSession();
    }

    /**
     * Initialize Audio Context
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
     * Create Audio Element
     */
    createAudioElement(soundName, url) {
        const audio = document.createElement('audio');
        audio.loop = true;
        audio.preload = 'auto';
        audio.setAttribute('webkit-playsinline', '');
        audio.setAttribute('playsinline', '');
        
        // Use local WAV files
        const sourceUrl = this.externalSources[soundName] || url;
        audio.src = sourceUrl;
        
        audio.addEventListener('canplaythrough', () => {
            console.log(`[OK] ${soundName} loaded`);
        });
        
        audio.addEventListener('error', (e) => {
            console.error(`[ERROR] ${soundName} load failed:`, e);
        });
        
        document.body.appendChild(audio);
        this.audioElements[soundName] = audio;
        this.volumes[soundName] = 0.5;
        return audio;
    }

    /**
     * Play Sound
     */
    playSound(soundName, volume = 0.5) {
        this.initAudioContext();
        
        const audio = this.audioElements[soundName];
        if (audio) {
            audio.volume = volume;
            this.volumes[soundName] = volume;
            
            audio.play()
                .then(() => {
                    console.log(`[OK] ${soundName} playing`);
                })
                .catch((e) => {
                    console.error(`[ERROR] ${soundName} play failed:`, e.message);
                });
            
            if (!this.currentSounds.includes(soundName)) {
                this.currentSounds.push(soundName);
            }
            this.isPlaying = true;
            this.updateMediaSession();
        }
    }

    /**
     * Stop Sound
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
     * Stop All Sounds
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
     * Set Volume
     */
    setVolume(soundName, volume) {
        const audio = this.audioElements[soundName];
        if (audio) {
            audio.volume = Math.max(0, Math.min(1, volume));
            this.volumes[soundName] = audio.volume;
        }
    }

    /**
     * Get Volume
     */
    getVolume(soundName) {
        return this.volumes[soundName] || 0.5;
    }

    /**
     * Update Media Session
     */
    updateMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
        }
    }

    /**
     * Setup Media Session
     */
    setupMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'WhiteNoise Pro',
                artist: 'White Noise',
                album: 'Nature Sounds Collection',
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
     * Initialize All Sounds
     */
    initializeSounds(soundNames) {
        soundNames.forEach((name) => {
            this.createAudioElement(name, `sounds/${name}.wav`);
        });
        console.log('[OK] Sounds initialized:', soundNames.length);
    }
}

// Global instance
const audioManager = new PWAAudioManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAAudioManager;
}
