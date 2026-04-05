/**
 * WhiteNoise Pro v4.0 - Main Application
 * Central application controller
 */

class WhiteNoiseApp {
    constructor() {
        this.audioEngine = null;
        this.mixer = null;
        this.store = null;
        this.timer = null;
        this.shortcutHandler = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Application
     */
    async init() {
        console.log('[App] Initializing WhiteNoise Pro v4.0...');

        // Initialize modules
        this.store = new Store();
        this.audioEngine = new AudioEngine();
        this.mixer = new SoundMixer(this.audioEngine);
        this.timer = new Timer(this);
        this.shortcutHandler = new ShortcutHandler(this);

        // Setup Media Session
        this.audioEngine.setupMediaSession(true);

        // Initialize shortcut handler
        this.shortcutHandler.init();

        // Load UI
        this.initUI();

        // Load sounds grid
        this.renderSoundsGrid('all');

        // Load presets
        this.renderPresets();

        // Setup event listeners
        this.setupEventListeners();

        // Apply theme
        this.applyTheme(this.store.getState('theme'));

        this.isInitialized = true;
        console.log('[App] Initialization complete');

        // Send toast
        this.showToast('WhiteNoise Pro v4.0 Ready!');
    }

    /**
     * Initialize UI
     */
    initUI() {
        // Initialize master volume slider
        const masterVolume = this.store.getState('masterVolume');
        const volumeSlider = document.querySelector('#masterVolumeValue');
        if (volumeSlider) {
            volumeSlider.textContent = `${Math.round(masterVolume * 100)}%`;
        }

        // Initialize settings toggles
        const fadeInOutToggle = document.getElementById('fadeInOutToggle');
        const autoSaveToggle = document.getElementById('autoSaveToggle');
        const notificationsToggle = document.getElementById('notificationsToggle');

        if (fadeInOutToggle) {
            fadeInOutToggle.checked = this.store.getState('settings.fadeIn');
        }
        if (autoSaveToggle) {
            autoSaveToggle.checked = this.store.getState('settings.autoSave');
        }
        if (notificationsToggle) {
            notificationsToggle.checked = this.store.getState('settings.notifications');
        }
    }

    /**
     * Setup Event Listeners
     */
    setupEventListeners() {
        // Mixer change events
        this.mixer.onChange((state) => {
            this.updatePlayerDisplay();
        });

        // Category tabs
        const tabs = document.querySelectorAll('.category-tabs .tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.switchCategory(category);
            });
        });

        // Bottom navigation
        const navItems = document.querySelectorAll('.bottom-nav .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Settings toggles
        const fadeInOutToggle = document.getElementById('fadeInOutToggle');
        const autoSaveToggle = document.getElementById('autoSaveToggle');
        const notificationsToggle = document.getElementById('notificationsToggle');

        if (fadeInOutToggle) {
            fadeInOutToggle.addEventListener('change', (e) => {
                this.store.setState('settings.fadeIn', e.target.checked);
                this.store.setState('settings.fadeOut', e.target.checked);
            });
        }

        if (autoSaveToggle) {
            autoSaveToggle.addEventListener('change', (e) => {
                this.store.setState('settings.autoSave', e.target.checked);
            });
        }

        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', (e) => {
                this.store.setState('settings.notifications', e.target.checked);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                this.masterPlayPause();
            }
        });
    }

    /**
     * Render Sounds Grid
     * @param {string} category - Category filter
     */
    renderSoundsGrid(category = 'all') {
        const grid = document.getElementById('soundsGrid');
        if (!grid) return;

        grid.innerHTML = '';

        const sounds = category === 'all' 
            ? getAllSounds() 
            : getSoundsByCategory(category);

        sounds.forEach(sound => {
            const card = this.createSoundCard(sound);
            grid.appendChild(card);
        });

        // Update active tab
        const tabs = document.querySelectorAll('.category-tabs .tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
    }

    /**
     * Create Sound Card
     * @param {Object} sound - Sound data
     * @returns {HTMLElement} Sound card element
     */
    createSoundCard(sound) {
        const card = document.createElement('div');
        card.className = 'sound-card';
        card.dataset.sound = sound.id;

        const isPlaying = this.audioEngine.isPlaying(sound.id);
        const volume = this.mixer.getTrackVolume(sound.id) || sound.defaultVolume;

        card.innerHTML = `
            <div class="sound-icon">${sound.icon}</div>
            <div class="sound-name">${sound.name}</div>
            <div class="sound-description">${sound.description}</div>
            <div class="sound-controls">
                <button class="play-btn ${isPlaying ? 'playing' : ''}" 
                        onclick="app.toggleSound('${sound.id}')">
                    ${isPlaying ? '⏸️' : '▶️'}
                </button>
                <input type="range" 
                       min="0" 
                       max="100" 
                       value="${Math.round(volume * 100)}"
                       oninput="app.setSoundVolume('${sound.id}', this.value / 100)"
                       class="volume-slider"
                       ${!isPlaying ? 'disabled' : ''}>
                <span class="volume-value">${Math.round(volume * 100)}%</span>
            </div>
        `;

        return card;
    }

    /**
     * Render Presets
     */
    renderPresets() {
        const grid = document.getElementById('presetGrid');
        if (!grid) return;

        grid.innerHTML = '';

        const presets = this.mixer.listPresets();

        presets.forEach(preset => {
            const card = document.createElement('div');
            card.className = 'preset-card';
            card.innerHTML = `
                <div class="preset-icon">${preset.icon}</div>
                <div class="preset-name">${preset.displayName}</div>
                <div class="preset-tracks">${preset.tracks.length} sounds</div>
                <button class="preset-btn" onclick="app.loadPreset('${preset.name}')">
                    ▶️ Play
                </button>
            `;
            grid.appendChild(card);
        });
    }

    /**
     * Toggle Sound Playback
     * @param {string} soundId - Sound identifier
     */
    toggleSound(soundId) {
        const isPlaying = this.mixer.toggleTrack(soundId);
        
        if (isPlaying) {
            this.store.addFavorite(soundId);
        }

        this.updateSoundCard(soundId);
        this.updatePlayerDisplay();
    }

    /**
     * Set Sound Volume
     * @param {string} soundId - Sound identifier
     * @param {number} volume - Volume (0.0 - 1.0)
     */
    setSoundVolume(soundId, volume) {
        this.mixer.setTrackVolume(soundId, volume);
        this.updateSoundCardVolume(soundId, volume);
    }

    /**
     * Set Master Volume
     * @param {number} volume - Master volume (0.0 - 1.0)
     */
    setMasterVolume(volume) {
        this.mixer.setMasterVolume(volume);
        this.store.setState('masterVolume', volume);

        const volumeValue = document.getElementById('masterVolumeValue');
        if (volumeValue) {
            volumeValue.textContent = `${Math.round(volume * 100)}%`;
        }
    }

    /**
     * Master Play/Pause
     */
    masterPlayPause() {
        const activeTracks = this.mixer.getActiveTrackIds();
        
        if (activeTracks.length === 0) {
            this.showToast('Select a sound to play');
            return;
        }

        const isPlaying = activeTracks.some(id => this.audioEngine.isPlaying(id));
        
        if (isPlaying) {
            // Pause all
            activeTracks.forEach(id => {
                this.audioEngine.stop(id);
            });
            this.updatePlayerDisplay();
        } else {
            // Resume all
            activeTracks.forEach(id => {
                const track = this.mixer.getTrackVolume(id);
                this.mixer.addTrack(id, track, false);
            });
            this.updatePlayerDisplay();
        }
    }

    /**
     * Master Stop
     */
    masterStop() {
        this.mixer.clear();
        this.updatePlayerDisplay();
        this.updateAllSoundCards();
    }

    /**
     * Load Preset
     * @param {string} presetName - Preset name
     */
    loadPreset(presetName) {
        const preset = this.mixer.loadPreset(presetName);
        
        if (preset) {
            this.updatePlayerDisplay();
            this.updateAllSoundCards();
            this.showToast(`Loaded preset: ${preset.displayName}`);

            // Start timer if preset has timer
            if (preset.timer && preset.timer.duration > 0) {
                this.timer.start(preset.timer.duration, {
                    fadeOut: preset.timer.fadeOut
                });
            }
        } else {
            this.showToast('Preset not found', 'error');
        }
    }

    /**
     * Switch Category
     * @param {string} category - Category name
     */
    switchCategory(category) {
        this.renderSoundsGrid(category);
    }

    /**
     * Switch View
     * @param {string} view - View name
     */
    switchView(view) {
        // Update navigation
        const navItems = document.querySelectorAll('.bottom-nav .nav-item');
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        // Update current view in store
        this.store.setState('currentView', view);

        console.log('[App] Switched to view:', view);
    }

    /**
     * Toggle Theme
     */
    toggleTheme() {
        const current = this.store.getState('theme');
        const themes = ['auto', 'light', 'dark'];
        const currentIndex = themes.indexOf(current);
        const next = themes[(currentIndex + 1) % themes.length];

        this.store.setState('theme', next);
        this.applyTheme(next);
        this.showToast(`Theme: ${next}`);
    }

    /**
     * Apply Theme
     * @param {string} theme - Theme name
     */
    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            root.setAttribute('data-theme', theme);
        }
    }

    /**
     * Toggle Settings Panel
     */
    toggleSettings() {
        const panel = document.getElementById('settingsPanel');
        if (panel) {
            panel.classList.toggle('open');
        }
    }

    /**
     * Update Player Display
     */
    updatePlayerDisplay() {
        const playerSounds = document.getElementById('playerSounds');
        const masterPlayBtn = document.getElementById('masterPlayBtn');
        
        if (!playerSounds) return;

        const activeTracks = this.mixer.getActiveTracks();

        if (activeTracks.length === 0) {
            playerSounds.innerHTML = '<span class="no-sounds">No sounds playing</span>';
            if (masterPlayBtn) masterPlayBtn.textContent = '▶️';
        } else {
            const names = activeTracks.map(track => {
                const sound = getSound(track.id);
                return sound ? `${sound.icon} ${sound.name}` : track.id;
            });
            playerSounds.innerHTML = `<span class="playing-sounds">${names.join(' + ')}</span>`;
            if (masterPlayBtn) masterPlayBtn.textContent = '⏸️';
        }
    }

    /**
     * Update Sound Card
     * @param {string} soundId - Sound identifier
     */
    updateSoundCard(soundId) {
        const card = document.querySelector(`.sound-card[data-sound="${soundId}"]`);
        if (!card) return;

        const isPlaying = this.audioEngine.isPlaying(soundId);
        const playBtn = card.querySelector('.play-btn');
        const volumeSlider = card.querySelector('.volume-slider');

        if (playBtn) {
            playBtn.textContent = isPlaying ? '⏸️' : '▶️';
            playBtn.classList.toggle('playing', isPlaying);
        }

        if (volumeSlider) {
            volumeSlider.disabled = !isPlaying;
        }
    }

    /**
     * Update Sound Card Volume
     * @param {string} soundId - Sound identifier
     * @param {number} volume - Volume
     */
    updateSoundCardVolume(soundId, volume) {
        const card = document.querySelector(`.sound-card[data-sound="${soundId}"]`);
        if (!card) return;

        const volumeValue = card.querySelector('.volume-value');
        const volumeSlider = card.querySelector('.volume-slider');

        if (volumeValue) {
            volumeValue.textContent = `${Math.round(volume * 100)}%`;
        }
        if (volumeSlider) {
            volumeSlider.value = Math.round(volume * 100);
        }
    }

    /**
     * Update All Sound Cards
     */
    updateAllSoundCards() {
        const cards = document.querySelectorAll('.sound-card');
        cards.forEach(card => {
            const soundId = card.dataset.sound;
            this.updateSoundCard(soundId);
        });
    }

    /**
     * Show Toast Notification
     * @param {string} message - Message text
     * @param {string} type - Type (success, error, info)
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    /**
     * Export Presets
     */
    exportPresets() {
        const presets = this.mixer.listPresets();
        const json = JSON.stringify(presets, null, 2);
        
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'whitenoise-presets.json';
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Presets exported');
    }

    /**
     * Reset All
     */
    resetAll() {
        if (confirm('Are you sure you want to reset all settings?')) {
            this.store.clear();
            this.mixer.clear();
            location.reload();
        }
    }
}

// Initialize app
const app = new WhiteNoiseApp();

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WhiteNoiseApp;
}
