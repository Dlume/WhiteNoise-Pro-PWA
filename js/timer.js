/**
 * WhiteNoise Pro v4.0 - Timer
 * Enhanced timer with fade out effect
 * 
 * Features:
 * - Pomodoro mode (25/5 min)
 * - Sleep timer
 * - Custom duration
 * - Fade out effect
 * - Notifications
 */

class Timer {
    /**
     * @param {WhiteNoiseApp} app - Main application instance
     */
    constructor(app) {
        this.app = app;
        this.isActive = false;
        this.duration = 0;
        this.remaining = 0;
        this.isPaused = false;
        this.fadeOut = false;
        this.intervalId = null;
        this.startTime = 0;
    }

    /**
     * Start Timer
     * @param {number} duration - Duration in seconds
     * @param {Object} options - Timer options
     * @param {boolean} options.fadeOut - Enable fade out
     * @param {boolean} options.notify - Enable notifications
     */
    start(duration, options = {}) {
        this.stop(); // Stop existing timer

        this.duration = duration;
        this.remaining = duration;
        this.fadeOut = options.fadeOut !== false;
        this.isPaused = false;
        this.startTime = Date.now();
        this.isActive = true;

        console.log(`[Timer] Started: ${duration}s, fadeOut: ${this.fadeOut}`);

        // Start countdown
        this.intervalId = setInterval(() => this.tick(), 1000);

        // Update UI
        this.updateDisplay();

        // Notify
        if (options.notify !== false) {
            this.app.showToast(`Timer started: ${this.formatTime(duration)}`);
        }

        // Update store
        this.app.store.setState('timer', {
            isActive: true,
            duration: duration,
            remaining: duration,
            isPaused: false,
            fadeOut: this.fadeOut
        });
    }

    /**
     * Stop Timer
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isActive = false;
        this.remaining = 0;

        console.log('[Timer] Stopped');

        // Update UI
        this.updateDisplay();

        // Update store
        this.app.store.setState('timer', {
            isActive: false,
            duration: 0,
            remaining: 0,
            isPaused: false,
            fadeOut: false
        });
    }

    /**
     * Pause Timer
     */
    pause() {
        if (!this.isActive || this.isPaused) return;

        this.isPaused = true;
        clearInterval(this.intervalId);
        this.intervalId = null;

        console.log('[Timer] Paused');

        // Update UI
        this.updateDisplay();

        // Update store
        this.app.store.setState('timer.isPaused', true);
    }

    /**
     * Resume Timer
     */
    resume() {
        if (!this.isActive || !this.isPaused) return;

        this.isPaused = false;
        this.startTime = Date.now() - (this.duration - this.remaining) * 1000;
        this.intervalId = setInterval(() => this.tick(), 1000);

        console.log('[Timer] Resumed');

        // Update UI
        this.updateDisplay();

        // Update store
        this.app.store.setState('timer.isPaused', false);
    }

    /**
     * Toggle Pause/Resume
     */
    toggle() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    /**
     * Timer Tick
     */
    tick() {
        this.remaining--;

        // Update display
        this.updateDisplay();

        // Update store
        this.app.store.setState('timer.remaining', this.remaining);

        // Check if time is up
        if (this.remaining <= 0) {
            this.complete();
        }

        // Apply fade out if enabled
        if (this.fadeOut && this.remaining <= 300) { // Last 5 minutes
            this.applyFadeOut();
        }
    }

    /**
     * Apply Fade Out
     */
    applyFadeOut() {
        const fadeOutDuration = 300; // 5 minutes
        const progress = 1 - (this.remaining / fadeOutDuration);
        const masterVolume = this.app.mixer.getMasterVolume();
        const newVolume = masterVolume * (1 - progress);

        this.app.mixer.setMasterVolume(Math.max(0, newVolume));
    }

    /**
     * Timer Complete
     */
    complete() {
        this.stop();

        console.log('[Timer] Complete');

        // Stop all sounds if fade out completed
        if (this.fadeOut) {
            this.app.mixer.setMasterVolume(1.0);
        }

        // Notify
        this.playCompletionSound();
        this.app.showToast('Timer complete!', 'success');

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('WhiteNoise Pro', {
                body: 'Timer complete!',
                icon: '/icons/icon-192.png'
            });
        }
    }

    /**
     * Play Completion Sound
     */
    playCompletionSound() {
        // Simple beep using Web Audio API
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gain.gain.setValueAtTime(0.3, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.5);
        } catch (error) {
            console.error('[Timer] Failed to play completion sound:', error);
        }
    }

    /**
     * Update Display
     */
    updateDisplay() {
        // Update timer display if exists
        const timerDisplay = document.querySelector('.timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = this.formatTime(this.remaining);
        }

        // Update timer button if exists
        const timerBtn = document.querySelector('.timer-btn');
        if (timerBtn) {
            if (this.isActive) {
                timerBtn.textContent = this.isPaused ? '▶️' : '⏸️';
                timerBtn.classList.add('active');
            } else {
                timerBtn.textContent = '⏱️';
                timerBtn.classList.remove('active');
            }
        }
    }

    /**
     * Format Time
     * @param {number} seconds - Seconds
     * @returns {string} Formatted time (MM:SS)
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Get Progress
     * @returns {number} Progress (0.0 - 1.0)
     */
    getProgress() {
        if (this.duration === 0) return 0;
        return 1 - (this.remaining / this.duration);
    }

    /**
     * Get Timer State
     * @returns {Object} Timer state
     */
    getState() {
        return {
            isActive: this.isActive,
            duration: this.duration,
            remaining: this.remaining,
            isPaused: this.isPaused,
            fadeOut: this.fadeOut,
            progress: this.getProgress()
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Timer;
}
