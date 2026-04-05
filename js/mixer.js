/**
 * WhiteNoise Pro v4.0 - Sound Mixer
 * Multi-track audio mixing with independent volume control
 * 
 * Features:
 * - Add/remove audio tracks
 * - Independent volume per track
 * - Master volume control
 * - Preset management
 * - State persistence
 */

class SoundMixer {
    /**
     * @param {AudioEngine} audioEngine - Audio engine instance
     */
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.tracks = new Map();
        this.masterVolume = 1.0;
        this.presetName = 'current';
    }

    /**
     * Add Track
     * @param {string} soundId - Sound identifier
     * @param {number} volume - Initial volume (0.0 - 1.0)
     * @param {boolean} fadeIn - Enable fade in
     */
    addTrack(soundId, volume = 0.5, fadeIn = true) {
        if (this.tracks.has(soundId)) {
            console.log(`[Mixer] Track ${soundId} already exists, updating volume`);
            this.setTrackVolume(soundId, volume);
            return this.tracks.get(soundId);
        }

        // Load audio if not already loaded
        const url = `audio/${soundId}.m4a`;
        
        this.audioEngine.load(soundId, url)
            .then(() => {
                // Play after loading
                this.audioEngine.play(soundId, { volume, fadeIn });
                
                // Store track info
                this.tracks.set(soundId, {
                    id: soundId,
                    volume: volume,
                    addedAt: Date.now()
                });
                
                console.log(`[Mixer] Added track: ${soundId}`);
                this.notifyChange();
            })
            .catch(error => {
                console.error(`[Mixer] Failed to add track ${soundId}:`, error);
            });

        return { id: soundId, volume };
    }

    /**
     * Remove Track
     * @param {string} soundId - Sound identifier
     */
    removeTrack(soundId) {
        if (!this.tracks.has(soundId)) {
            return;
        }

        this.audioEngine.stop(soundId);
        this.tracks.delete(soundId);
        console.log(`[Mixer] Removed track: ${soundId}`);
        this.notifyChange();
    }

    /**
     * Set Track Volume
     * @param {string} soundId - Sound identifier
     * @param {number} volume - Volume (0.0 - 1.0)
     */
    setTrackVolume(soundId, volume) {
        if (!this.tracks.has(soundId)) {
            return;
        }

        const track = this.tracks.get(soundId);
        track.volume = volume;
        this.audioEngine.setVolume(soundId, volume * this.masterVolume);
        console.log(`[Mixer] Track ${soundId} volume: ${volume}`);
        this.notifyChange();
    }

    /**
     * Get Track Volume
     * @param {string} soundId - Sound identifier
     * @returns {number} Current volume
     */
    getTrackVolume(soundId) {
        const track = this.tracks.get(soundId);
        return track ? track.volume : 0;
    }

    /**
     * Set Master Volume
     * @param {number} volume - Master volume (0.0 - 1.0)
     */
    setMasterVolume(volume) {
        this.masterVolume = volume;
        this.audioEngine.setMasterVolume(volume);
        
        // Update all track volumes
        this.tracks.forEach((track, soundId) => {
            this.audioEngine.setVolume(soundId, track.volume * volume);
        });
        
        console.log(`[Mixer] Master volume: ${volume}`);
        this.notifyChange();
    }

    /**
     * Get Master Volume
     * @returns {number} Current master volume
     */
    getMasterVolume() {
        return this.masterVolume;
    }

    /**
     * Toggle Track Playback
     * @param {string} soundId - Sound identifier
     */
    toggleTrack(soundId) {
        if (this.audioEngine.isPlaying(soundId)) {
            this.removeTrack(soundId);
            return false;
        } else {
            const track = this.tracks.get(soundId);
            const volume = track ? track.volume : 0.5;
            this.addTrack(soundId, volume);
            return true;
        }
    }

    /**
     * Get Active Tracks
     * @returns {Array<Object>} List of active tracks
     */
    getActiveTracks() {
        return Array.from(this.tracks.values());
    }

    /**
     * Get Active Track IDs
     * @returns {Array<string>} List of active sound IDs
     */
    getActiveTrackIds() {
        return Array.from(this.tracks.keys());
    }

    /**
     * Clear All Tracks
     */
    clear() {
        const trackIds = this.getActiveTrackIds();
        trackIds.forEach(id => this.removeTrack(id));
        console.log('[Mixer] Cleared all tracks');
    }

    /**
     * Save Current Mix as Preset
     * @param {string} name - Preset name
     * @param {Object} options - Preset options
     */
    savePreset(name, options = {}) {
        const preset = {
            name: name,
            displayName: options.displayName || name,
            icon: options.icon || '⭐',
            tracks: this.getActiveTracks().map(track => ({
                id: track.id,
                volume: track.volume
            })),
            masterVolume: this.masterVolume,
            timer: options.timer || null,
            createdAt: Date.now()
        };

        // Save to localStorage
        const presets = this.getUserPresets();
        
        // Remove existing preset with same name
        const existingIndex = presets.findIndex(p => p.name === name);
        if (existingIndex >= 0) {
            presets[existingIndex] = preset;
        } else {
            presets.push(preset);
        }
        
        localStorage.setItem('whitenoise-presets', JSON.stringify(presets));
        console.log(`[Mixer] Saved preset: ${name}`);
        
        return preset;
    }

    /**
     * Load Preset
     * @param {string} name - Preset name
     * @returns {Object|null} Preset data or null
     */
    loadPreset(name) {
        const preset = this.getPreset(name);
        if (!preset) {
            console.log(`[Mixer] Preset not found: ${name}`);
            return null;
        }

        // Clear current tracks
        this.clear();

        // Load preset tracks
        setTimeout(() => {
            preset.tracks.forEach(track => {
                this.addTrack(track.id, track.volume, false);
            });

            // Set master volume
            if (preset.masterVolume) {
                this.setMasterVolume(preset.masterVolume);
            }

            console.log(`[Mixer] Loaded preset: ${name}`);
            this.notifyChange();
        }, 100);

        return preset;
    }

    /**
     * Get Preset
     * @param {string} name - Preset name
     * @returns {Object|null} Preset data or null
     */
    getPreset(name) {
        // Check user presets first
        const userPresets = this.getUserPresets();
        let preset = userPresets.find(p => p.name === name);

        // Check default presets
        if (!preset) {
            preset = this.getDefaultPresets().find(p => p.name === name);
        }

        return preset || null;
    }

    /**
     * Delete Preset
     * @param {string} name - Preset name
     */
    deletePreset(name) {
        const presets = this.getUserPresets();
        const filtered = presets.filter(p => p.name !== name);
        
        if (filtered.length < presets.length) {
            localStorage.setItem('whitenoise-presets', JSON.stringify(filtered));
            console.log(`[Mixer] Deleted preset: ${name}`);
            return true;
        }
        
        return false;
    }

    /**
     * List All Presets
     * @returns {Array<Object>} List of presets
     */
    listPresets() {
        const defaults = this.getDefaultPresets();
        const user = this.getUserPresets();
        return [...defaults, ...user];
    }

    /**
     * Get Default Presets
     * @returns {Array<Object>} Default presets
     */
    getDefaultPresets() {
        return [
            {
                name: 'sleep',
                displayName: 'Sleep',
                icon: '🌙',
                tracks: [
                    { id: 'ocean', volume: 0.4 },
                    { id: 'night', volume: 0.3 }
                ],
                masterVolume: 1.0,
                timer: { duration: 1800, fadeOut: true }
            },
            {
                name: 'focus',
                displayName: 'Focus',
                icon: '🎯',
                tracks: [
                    { id: 'rain', volume: 0.5 },
                    { id: 'cafe', volume: 0.3 }
                ],
                masterVolume: 1.0,
                timer: { duration: 1500, fadeOut: false }
            },
            {
                name: 'meditate',
                displayName: 'Meditate',
                icon: '🧘',
                tracks: [
                    { id: 'forest', volume: 0.4 },
                    { id: 'stream', volume: 0.3 }
                ],
                masterVolume: 1.0,
                timer: { duration: 600, fadeOut: true }
            },
            {
                name: 'relax',
                displayName: 'Relax',
                icon: '☕',
                tracks: [
                    { id: 'cafe', volume: 0.3 },
                    { id: 'fireplace', volume: 0.4 }
                ],
                masterVolume: 1.0,
                timer: { duration: 300, fadeOut: true }
            },
            {
                name: 'nature',
                displayName: 'Nature',
                icon: '🌲',
                tracks: [
                    { id: 'forest', volume: 0.5 },
                    { id: 'birds', volume: 0.4 },
                    { id: 'wind', volume: 0.3 }
                ],
                masterVolume: 1.0,
                timer: null
            }
        ];
    }

    /**
     * Get User Presets
     * @returns {Array<Object>} User presets
     */
    getUserPresets() {
        const data = localStorage.getItem('whitenoise-presets');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Export Preset to JSON
     * @param {string} name - Preset name
     * @returns {string|null} JSON string or null
     */
    exportPreset(name) {
        const preset = this.getPreset(name);
        if (!preset) {
            return null;
        }
        return JSON.stringify(preset, null, 2);
    }

    /**
     * Import Preset from JSON
     * @param {string} jsonString - JSON string
     * @returns {Object|null} Imported preset or null
     */
    importPreset(jsonString) {
        try {
            const preset = JSON.parse(jsonString);
            
            if (!preset.name || !preset.tracks) {
                console.error('[Mixer] Invalid preset format');
                return null;
            }

            // Save to user presets
            const presets = this.getUserPresets();
            presets.push(preset);
            localStorage.setItem('whitenoise-presets', JSON.stringify(presets));
            
            console.log(`[Mixer] Imported preset: ${preset.name}`);
            return preset;
        } catch (error) {
            console.error('[Mixer] Failed to import preset:', error);
            return null;
        }
    }

    /**
     * Get Mixer State
     * @returns {Object} Current state
     */
    getState() {
        return {
            tracks: this.getActiveTracks(),
            masterVolume: this.masterVolume,
            activeCount: this.tracks.size
        };
    }

    /**
     * Notify State Change
     */
    notifyChange() {
        // Dispatch custom event for UI updates
        const event = new CustomEvent('mixer-change', {
            detail: this.getState()
        });
        window.dispatchEvent(event);
    }

    /**
     * Subscribe to Changes
     * @param {Function} callback - Callback function
     */
    onChange(callback) {
        window.addEventListener('mixer-change', (event) => {
            callback(event.detail);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundMixer;
}
