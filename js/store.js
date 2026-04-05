/**
 * WhiteNoise Pro v4.0 - Store
 * Reactive state management with Observer pattern
 * 
 * Features:
 * - Centralized state
 * - Reactive updates
 * - Subscription mechanism
 * - LocalStorage persistence
 * - Undo/Redo support
 */

class Store {
    constructor() {
        this.state = {
            // Audio state
            masterVolume: 1.0,
            trackVolumes: {},
            activeTracks: [],
            isPlaying: false,
            
            // Timer state
            timer: {
                isActive: false,
                duration: 0,
                remaining: 0,
                isPaused: false,
                fadeOut: false
            },
            
            // Breathing state
            breathing: {
                isActive: false,
                mode: '4-7-8',
                duration: 0,
                remaining: 0
            },
            
            // UI state
            theme: 'auto', // 'light', 'dark', 'auto'
            currentView: 'home', // 'home', 'mixer', 'presets', 'settings'
            showSavePresetDialog: false,
            
            // Settings
            settings: {
                fadeIn: true,
                fadeOut: true,
                fadeInDuration: 2.0,
                fadeOutDuration: 0.5,
                autoSave: true,
                notifications: true
            },
            
            // Statistics
            stats: {
                totalPlayTime: 0,
                sessionsCount: 0,
                favoriteSounds: [],
                lastPlayed: null
            }
        };

        this.subscribers = new Set();
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;

        // Load persisted state
        this.load();
    }

    /**
     * Get State
     * @param {string} path - Dot notation path (e.g., 'timer.duration')
     * @returns {any} State value
     */
    getState(path) {
        if (!path) {
            return { ...this.state };
        }

        const keys = path.split('.');
        let value = this.state;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }

        return value;
    }

    /**
     * Set State
     * @param {string|Object} path - Dot notation path or partial state object
     * @param {any} value - New value (if path is string)
     * @param {boolean} saveHistory - Whether to save to history
     */
    setState(path, value, saveHistory = true) {
        let partialState;

        if (typeof path === 'string') {
            partialState = {};
            const keys = path.split('.');
            let current = partialState;

            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = {};
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
        } else {
            partialState = path;
            saveHistory = value !== false;
        }

        // Save to history if enabled
        if (saveHistory) {
            this.saveToHistory();
        }

        // Merge state
        Object.assign(this.state, this.mergeState(this.state, partialState));

        // Notify subscribers
        this.notify();

        // Auto-save
        if (this.state.settings.autoSave) {
            this.save();
        }
    }

    /**
     * Merge State (deep merge)
     */
    mergeState(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (
                    source[key] &&
                    typeof source[key] === 'object' &&
                    !Array.isArray(source[key])
                ) {
                    result[key] = this.mergeState(
                        target[key] || {},
                        source[key]
                    );
                } else {
                    result[key] = source[key];
                }
            }
        }

        return result;
    }

    /**
     * Subscribe to State Changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.subscribers.add(callback);

        return () => {
            this.subscribers.delete(callback);
        };
    }

    /**
     * Notify All Subscribers
     */
    notify() {
        const stateSnapshot = { ...this.state };
        this.subscribers.forEach(callback => {
            try {
                callback(stateSnapshot);
            } catch (error) {
                console.error('[Store] Subscriber error:', error);
            }
        });
    }

    /**
     * Save to History (for undo/redo)
     */
    saveToHistory() {
        const stateSnapshot = JSON.stringify(this.state);
        
        // Remove future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // Add to history
        this.history.push(stateSnapshot);

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    /**
     * Undo
     * @returns {boolean} Success
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const stateSnapshot = this.history[this.historyIndex];
            this.state = JSON.parse(stateSnapshot);
            this.notify();
            return true;
        }
        return false;
    }

    /**
     * Redo
     * @returns {boolean} Success
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const stateSnapshot = this.history[this.historyIndex];
            this.state = JSON.parse(stateSnapshot);
            this.notify();
            return true;
        }
        return false;
    }

    /**
     * Save to LocalStorage
     */
    save() {
        try {
            const toSave = {
                masterVolume: this.state.masterVolume,
                trackVolumes: this.state.trackVolumes,
                theme: this.state.theme,
                settings: this.state.settings,
                stats: this.state.stats
            };

            localStorage.setItem('whitenoise-store', JSON.stringify(toSave));
            console.log('[Store] Saved to localStorage');
        } catch (error) {
            console.error('[Store] Failed to save:', error);
        }
    }

    /**
     * Load from LocalStorage
     */
    load() {
        try {
            const saved = localStorage.getItem('whitenoise-store');
            
            if (saved) {
                const parsed = JSON.parse(saved);
                
                // Merge with default state
                this.setState({
                    masterVolume: parsed.masterVolume || 1.0,
                    trackVolumes: parsed.trackVolumes || {},
                    theme: parsed.theme || 'auto',
                    settings: { ...this.state.settings, ...parsed.settings },
                    stats: { ...this.state.stats, ...parsed.stats }
                }, false); // Don't save to history
                
                console.log('[Store] Loaded from localStorage');
            }
        } catch (error) {
            console.error('[Store] Failed to load:', error);
        }
    }

    /**
     * Reset to Defaults
     */
    reset() {
        this.setState({
            masterVolume: 1.0,
            trackVolumes: {},
            activeTracks: [],
            isPlaying: false,
            theme: 'auto',
            settings: {
                fadeIn: true,
                fadeOut: true,
                fadeInDuration: 2.0,
                fadeOutDuration: 0.5,
                autoSave: true,
                notifications: true
            }
        });
        
        console.log('[Store] Reset to defaults');
    }

    /**
     * Clear LocalStorage
     */
    clear() {
        localStorage.removeItem('whitenoise-store');
        this.reset();
        console.log('[Store] Cleared localStorage');
    }

    /**
     * Get Store Stats
     * @returns {Object} Store statistics
     */
    getStats() {
        return {
            subscribers: this.subscribers.size,
            historyLength: this.history.length,
            historyIndex: this.historyIndex,
            stateSize: JSON.stringify(this.state).length
        };
    }

    /**
     * Update Statistics
     * @param {Object} updates - Stats updates
     */
    updateStats(updates) {
        this.setState({
            stats: { ...this.state.stats, ...updates }
        });
    }

    /**
     * Add Favorite Sound
     * @param {string} soundId - Sound identifier
     */
    addFavorite(soundId) {
        const favorites = this.state.stats.favoriteSounds;
        
        if (!favorites.includes(soundId)) {
            favorites.push(soundId);
            this.setState({ 'stats.favoriteSounds': favorites });
        }
    }

    /**
     * Remove Favorite Sound
     * @param {string} soundId - Sound identifier
     */
    removeFavorite(soundId) {
        const favorites = this.state.stats.favoriteSounds;
        const filtered = favorites.filter(id => id !== soundId);
        this.setState({ 'stats.favoriteSounds': filtered });
    }

    /**
     * Check if Sound is Favorite
     * @param {string} soundId - Sound identifier
     * @returns {boolean} True if favorite
     */
    isFavorite(soundId) {
        return this.state.stats.favoriteSounds.includes(soundId);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Store;
}
