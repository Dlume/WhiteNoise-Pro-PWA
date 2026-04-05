/**
 * WhiteNoise Pro v4.0 - Shortcut Handler
 * iOS Shortcuts integration via URL parameters
 * 
 * URL Protocol:
 * - whitenoise://play?sound=rain&volume=0.5&duration=1800
 * - whitenoise://stop
 * - whitenoise://preset?name=sleep
 * - whitenoise://mix?sounds=rain,ocean&volumes=0.5,0.3
 */

class ShortcutHandler {
    /**
     * @param {Object} app - Main application instance
     */
    constructor(app) {
        this.app = app;
        this.commands = {
            play: this.handlePlay.bind(this),
            stop: this.handleStop.bind(this),
            preset: this.handlePreset.bind(this),
            mix: this.handleMix.bind(this)
        };
    }

    /**
     * Initialize Shortcut Handler
     */
    init() {
        // Parse URL on page load
        this.parseURL(window.location.href);
        
        // Listen for hash changes (SPA navigation)
        window.addEventListener('hashchange', () => {
            this.parseURL(window.location.href);
        });

        // Listen for shortcut events
        window.addEventListener('shortcut-command', (event) => {
            this.execute(event.detail.command, event.detail.params);
        });

        console.log('[Shortcut] Initialized');
    }

    /**
     * Parse URL and execute command
     * @param {string} url - Full URL
     */
    parseURL(url) {
        try {
            const urlObj = new URL(url);
            const params = urlObj.searchParams;
            
            // Check for command parameter
            if (params.has('command')) {
                const command = params.get('command');
                this.execute(command, params);
                
                // Clean URL (remove command params after execution)
                if (window.history && window.history.replaceState) {
                    const cleanUrl = urlObj.origin + urlObj.pathname;
                    window.history.replaceState({}, document.title, cleanUrl);
                }
            }
            
            // Check for direct sound parameter
            if (params.has('sound')) {
                this.handlePlay(params);
            }
            
            // Check for preset parameter
            if (params.has('preset')) {
                const presetName = params.get('preset');
                this.handlePreset(new URLSearchParams(`name=${presetName}`));
            }
        } catch (error) {
            console.error('[Shortcut] Failed to parse URL:', error);
        }
    }

    /**
     * Execute Command
     * @param {string} command - Command name
     * @param {URLSearchParams} params - Command parameters
     */
    execute(command, params) {
        const handler = this.commands[command];
        
        if (handler) {
            console.log(`[Shortcut] Executing: ${command}`);
            handler(params);
        } else {
            console.error(`[Shortcut] Unknown command: ${command}`);
        }
    }

    /**
     * Handle Play Command
     * @param {URLSearchParams} params - Command parameters
     */
    handlePlay(params) {
        const soundId = params.get('sound');
        const volume = parseFloat(params.get('volume') || '0.5');
        const duration = parseInt(params.get('duration') || '0');
        const fadeIn = params.get('fadeIn') !== 'false';
        
        if (!soundId) {
            console.error('[Shortcut] Play command requires sound parameter');
            return;
        }

        // Add track
        this.app.mixer.addTrack(soundId, volume, fadeIn);
        
        // Start timer if duration specified
        if (duration > 0) {
            this.app.timer.start(duration, { fadeOut: true });
        }

        // Send feedback
        this.sendFeedback('playing', {
            sound: soundId,
            volume: volume,
            duration: duration
        });

        console.log(`[Shortcut] Playing ${soundId} at volume ${volume}`);
    }

    /**
     * Handle Stop Command
     * @param {URLSearchParams} params - Command parameters
     */
    handleStop(params) {
        // Stop all tracks
        this.app.mixer.clear();
        
        // Stop timer
        if (this.app.timer) {
            this.app.timer.stop();
        }

        // Send feedback
        this.sendFeedback('stopped');

        console.log('[Shortcut] Stopped all playback');
    }

    /**
     * Handle Preset Command
     * @param {URLSearchParams} params - Command parameters
     */
    handlePreset(params) {
        const presetName = params.get('name');
        
        if (!presetName) {
            console.error('[Shortcut] Preset command requires name parameter');
            return;
        }

        // Load preset
        const preset = this.app.mixer.loadPreset(presetName);
        
        if (preset) {
            // Start timer if preset has timer config
            if (preset.timer && preset.timer.duration > 0) {
                this.app.timer.start(preset.timer.duration, {
                    fadeOut: preset.timer.fadeOut
                });
            }

            // Send feedback
            this.sendFeedback('preset-loaded', {
                name: presetName,
                tracks: preset.tracks.length
            });

            console.log(`[Shortcut] Loaded preset: ${presetName}`);
        } else {
            console.error(`[Shortcut] Preset not found: ${presetName}`);
            this.sendFeedback('error', {
                message: `Preset '${presetName}' not found`
            });
        }
    }

    /**
     * Handle Mix Command
     * @param {URLSearchParams} params - Command parameters
     */
    handleMix(params) {
        const soundsParam = params.get('sounds');
        const volumesParam = params.get('volumes');
        
        if (!soundsParam) {
            console.error('[Shortcut] Mix command requires sounds parameter');
            return;
        }

        const sounds = soundsParam.split(',');
        const volumes = volumesParam ? volumesParam.split(',').map(parseFloat) : [];

        // Add all sounds
        sounds.forEach((soundId, index) => {
            const volume = volumes[index] || 0.5;
            this.app.mixer.addTrack(soundId, volume, false);
        });

        // Send feedback
        this.sendFeedback('mixing', {
            sounds: sounds,
            count: sounds.length
        });

        console.log(`[Shortcut] Mixed ${sounds.length} sounds`);
    }

    /**
     * Send Feedback (for future implementation)
     * @param {string} action - Action type
     * @param {Object} data - Action data
     */
    sendFeedback(action, data = {}) {
        // Store feedback in localStorage for shortcuts to read
        const feedback = {
            action: action,
            data: data,
            timestamp: Date.now()
        };

        localStorage.setItem('whitenoise-shortcut-feedback', JSON.stringify(feedback));

        // Dispatch custom event
        const event = new CustomEvent('shortcut-feedback', {
            detail: feedback
        });
        window.dispatchEvent(event);

        console.log('[Shortcut] Feedback:', action, data);
    }

    /**
     * Create Shortcut URL
     * @param {string} command - Command name
     * @param {Object} params - Command parameters
     * @returns {string} Shortcut URL
     */
    createShortcutURL(command, params = {}) {
        const baseUrl = window.location.origin + window.location.pathname;
        const urlParams = new URLSearchParams({ command, ...params });
        return `${baseUrl}?${urlParams.toString()}`;
    }

    /**
     * Get Shortcut Examples
     * @returns {Array<Object>} List of shortcut examples
     */
    getExamples() {
        return [
            {
                name: 'Start Focus',
                description: 'Start 25-minute focus session with rain',
                url: this.createShortcutURL('play', {
                    sound: 'rain',
                    volume: '0.5',
                    duration: '1500'
                })
            },
            {
                name: 'Sleep Mode',
                description: 'Start 30-minute sleep mode with ocean',
                url: this.createShortcutURL('play', {
                    sound: 'ocean',
                    volume: '0.4',
                    duration: '1800'
                })
            },
            {
                name: 'Load Preset',
                description: 'Load sleep preset',
                url: this.createShortcutURL('preset', {
                    name: 'sleep'
                })
            },
            {
                name: 'Custom Mix',
                description: 'Mix rain and cafe sounds',
                url: this.createShortcutURL('mix', {
                    sounds: 'rain,cafe',
                    volumes: '0.5,0.3'
                })
            },
            {
                name: 'Stop Playback',
                description: 'Stop all sounds',
                url: this.createShortcutURL('stop')
            }
        ];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShortcutHandler;
}
