/**
 * WhiteNoise Pro v4.0 - Audio Engine
 * Professional Web Audio API implementation
 * 
 * Features:
 * - Web Audio API based playback
 * - Independent volume control per track
 * - Fade in/out effects
 * - Memory-efficient buffer management
 * - iOS Safari compatible
 */

class AudioEngine {
    constructor() {
        this.context = null;
        this.audioBuffers = new Map();
        this.activeTracks = new Map();
        this.masterGain = null;
        this.isInitialized = false;
        this.maxBuffers = 10; // LRU cache size
    }

    /**
     * Initialize Audio Context
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = 1.0;
            this.isInitialized = true;
            console.log('[AudioEngine] Initialized');
        } catch (error) {
            console.error('[AudioEngine] Failed to initialize:', error);
            throw error;
        }
    }

    /**
     * Resume Audio Context (for iOS)
     */
    async resume() {
        if (this.context && this.context.state === 'suspended') {
            await this.context.resume();
            console.log('[AudioEngine] Resumed');
        }
    }

    /**
     * Load Audio File
     * @param {string} soundId - Sound identifier (e.g., 'rain', 'ocean')
     * @param {string} url - Audio file URL
     */
    async load(soundId, url) {
        if (this.audioBuffers.has(soundId)) {
            console.log(`[AudioEngine] ${soundId} already loaded`);
            return this.audioBuffers.get(soundId);
        }

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            
            this.audioBuffers.set(soundId, audioBuffer);
            console.log(`[AudioEngine] Loaded: ${soundId}`);
            
            // LRU cache management
            if (this.audioBuffers.size > this.maxBuffers) {
                this.unloadLeastUsed();
            }
            
            return audioBuffer;
        } catch (error) {
            console.error(`[AudioEngine] Failed to load ${soundId}:`, error);
            throw error;
        }
    }

    /**
     * Play Sound
     * @param {string} soundId - Sound identifier
     * @param {Object} options - Playback options
     * @param {number} options.volume - Volume (0.0 - 1.0)
     * @param {boolean} options.fadeIn - Enable fade in
     * @param {number} options.fadeInDuration - Fade in duration in seconds
     */
    play(soundId, options = {}) {
        if (!this.isInitialized) {
            this.init();
        }

        const buffer = this.audioBuffers.get(soundId);
        if (!buffer) {
            console.error(`[AudioEngine] Sound not loaded: ${soundId}`);
            return null;
        }

        // Stop existing track if playing
        if (this.activeTracks.has(soundId)) {
            this.stop(soundId);
        }

        // Create audio source
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Create gain node for volume control
        const gainNode = this.context.createGain();
        const volume = options.volume !== undefined ? options.volume : 0.5;
        
        // Connect nodes: source → gain → master
        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Apply fade in if requested
        if (options.fadeIn) {
            const duration = options.fadeInDuration || 2.0;
            gainNode.gain.setValueAtTime(0, this.context.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + duration);
        } else {
            gainNode.gain.value = volume;
        }

        // Start playback
        source.start(0);

        // Store track info
        const track = {
            id: soundId,
            source: source,
            gainNode: gainNode,
            volume: volume,
            startTime: this.context.currentTime
        };

        this.activeTracks.set(soundId, track);
        console.log(`[AudioEngine] Playing: ${soundId} at volume ${volume}`);

        return track;
    }

    /**
     * Stop Sound
     * @param {string} soundId - Sound identifier
     */
    stop(soundId) {
        const track = this.activeTracks.get(soundId);
        if (!track) {
            return;
        }

        // Fade out
        const fadeOutDuration = 0.5;
        track.gainNode.gain.cancelScheduledValues(this.context.currentTime);
        track.gainNode.gain.setValueAtTime(track.volume, this.context.currentTime);
        track.gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + fadeOutDuration);

        // Stop after fade out
        setTimeout(() => {
            try {
                track.source.stop();
                track.source.disconnect();
                track.gainNode.disconnect();
                this.activeTracks.delete(soundId);
                console.log(`[AudioEngine] Stopped: ${soundId}`);
            } catch (error) {
                // Ignore errors from already stopped sources
            }
        }, fadeOutDuration * 1000);
    }

    /**
     * Set Volume
     * @param {string} soundId - Sound identifier
     * @param {number} volume - Volume (0.0 - 1.0)
     */
    setVolume(soundId, volume) {
        const track = this.activeTracks.get(soundId);
        if (!track) {
            return;
        }

        track.volume = volume;
        track.gainNode.gain.cancelScheduledValues(this.context.currentTime);
        track.gainNode.gain.setTargetAtTime(volume, this.context.currentTime, 0.1);
        
        console.log(`[AudioEngine] Volume ${soundId}: ${volume}`);
    }

    /**
     * Get Volume
     * @param {string} soundId - Sound identifier
     * @returns {number} Current volume
     */
    getVolume(soundId) {
        const track = this.activeTracks.get(soundId);
        return track ? track.volume : 0;
    }

    /**
     * Set Master Volume
     * @param {number} volume - Master volume (0.0 - 1.0)
     */
    setMasterVolume(volume) {
        if (!this.masterGain) {
            return;
        }
        
        this.masterGain.gain.cancelScheduledValues(this.context.currentTime);
        this.masterGain.gain.setTargetAtTime(volume, this.context.currentTime, 0.1);
        console.log(`[AudioEngine] Master volume: ${volume}`);
    }

    /**
     * Get Master Volume
     * @returns {number} Current master volume
     */
    getMasterVolume() {
        return this.masterGain ? this.masterGain.gain.value : 1.0;
    }

    /**
     * Stop All Sounds
     */
    stopAll() {
        const soundIds = Array.from(this.activeTracks.keys());
        soundIds.forEach(id => this.stop(id));
        console.log('[AudioEngine] Stopped all sounds');
    }

    /**
     * Get Active Tracks
     * @returns {Array<string>} List of active sound IDs
     */
    getActiveTracks() {
        return Array.from(this.activeTracks.keys());
    }

    /**
     * Check if Sound is Playing
     * @param {string} soundId - Sound identifier
     * @returns {boolean} True if playing
     */
    isPlaying(soundId) {
        return this.activeTracks.has(soundId);
    }

    /**
     * Unload Least Used Buffer (LRU)
     */
    unloadLeastUsed() {
        // Simple implementation: remove first item
        const firstKey = this.audioBuffers.keys().next().value;
        if (firstKey) {
            this.audioBuffers.delete(firstKey);
            console.log(`[AudioEngine] Unloaded least used: ${firstKey}`);
        }
    }

    /**
     * Unload Sound Buffer
     * @param {string} soundId - Sound identifier
     */
    unload(soundId) {
        if (this.audioBuffers.has(soundId)) {
            this.audioBuffers.delete(soundId);
            console.log(`[AudioEngine] Unloaded: ${soundId}`);
        }
    }

    /**
     * Get Engine Stats
     * @returns {Object} Engine statistics
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            loadedBuffers: this.audioBuffers.size,
            activeTracks: this.activeTracks.size,
            contextState: this.context ? this.context.state : 'not created'
        };
    }

    /**
     * Setup Media Session (for lock screen controls)
     */
    setupMediaSession(updateMetadata = true) {
        if (!('mediaSession' in navigator)) {
            console.log('[AudioEngine] Media Session API not supported');
            return;
        }

        if (updateMetadata) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'WhiteNoise Pro',
                artist: 'WhiteNoise Pro',
                album: 'WhiteNoise Pro',
                artwork: [
                    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
                ]
            });
        }

        // Set action handlers
        navigator.mediaSession.setActionHandler('play', () => {
            this.resume();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            this.getActiveTracks().forEach(id => {
                const track = this.activeTracks.get(id);
                if (track) {
                    track.source.stop();
                }
            });
        });

        navigator.mediaSession.setActionHandler('stop', () => {
            this.stopAll();
        });

        console.log('[AudioEngine] Media Session configured');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioEngine;
}
