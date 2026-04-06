// WhiteNoise Pro - Main Application Logic

class WhiteNoiseApp {
    constructor() {
        this.sounds = [];
        this.activeSounds = new Set();
        this.audioContext = null;
        this.init();
    }

    init() {
        this.loadSounds();
        this.renderSounds();
        this.bindEvents();
        this.initTabs();
    }

    loadSounds() {
        this.sounds = [
            { id: 'rain', name: 'Rain', icon: '🌧️', category: 'rain' },
            { id: 'heavy-rain', name: 'Heavy Rain', icon: '⛈️', category: 'rain' },
            { id: 'thunder', name: 'Thunder', icon: '⚡', category: 'rain' },
            { id: 'ocean', name: 'Ocean', icon: '🌊', category: 'water' },
            { id: 'river', name: 'River', icon: '🏞️', category: 'water' },
            { id: 'waterfall', name: 'Waterfall', icon: '💦', category: 'water' },
            { id: 'forest', name: 'Forest', icon: '🌲', category: 'nature' },
            { id: 'birds', name: 'Birds', icon: '🐦', category: 'nature' },
            { id: 'wind', name: 'Wind', icon: '💨', category: 'nature' },
            { id: 'fire', name: 'Fire', icon: '🔥', category: 'nature' },
            { id: 'white-noise', name: 'White Noise', icon: '⚪', category: 'white-noise' },
            { id: 'pink-noise', name: 'Pink Noise', icon: '🌸', category: 'white-noise' },
            { id: 'brown-noise', name: 'Brown Noise', icon: '🟤', category: 'white-noise' },
            { id: 'cafe', name: 'Café', icon: '☕', category: 'urban' },
            { id: 'train', name: 'Train', icon: '🚂', category: 'urban' },
            { id: 'city', name: 'City', icon: '🌃', category: 'urban' }
        ];
    }

    renderSounds() {
        const grid = document.getElementById('sounds-grid');
        if (!grid) return;

        grid.innerHTML = this.sounds.map(sound => `
            <div class="sound-card" data-sound="${sound.id}">
                <div class="sound-icon">${sound.icon}</div>
                <div class="sound-name">${sound.name}</div>
                <div class="sound-volume">
                    <input type="range" min="0" max="100" value="50" data-volume="${sound.id}">
                </div>
            </div>
        `).join('');
    }

    bindEvents() {
        // Sound cards
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.sound-card');
            if (card) {
                const soundId = card.dataset.sound;
                this.toggleSound(soundId, card);
            }
        });

        // Volume controls
        document.addEventListener('input', (e) => {
            if (e.target.matches('input[type="range"]')) {
                const soundId = e.target.dataset.volume;
                this.adjustVolume(soundId, e.target.value);
            }
        });

        // Play/Stop all
        document.getElementById('play-all')?.addEventListener('click', () => this.playAll());
        document.getElementById('stop-all')?.addEventListener('click', () => this.stopAll());

        // Focus mode
        document.getElementById('focus-play')?.addEventListener('click', () => this.startFocus());
        document.getElementById('focus-stop')?.addEventListener('click', () => this.stopFocus());

        // Duration buttons
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Breathing
        document.getElementById('breathing-start')?.addEventListener('click', () => this.startBreathing());
        document.getElementById('breathing-stop')?.addEventListener('click', () => this.stopBreathing());
    }

    initTabs() {
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                
                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    }

    toggleSound(soundId, card) {
        if (this.activeSounds.has(soundId)) {
            this.stopSound(soundId);
            card.classList.remove('active');
        } else {
            this.playSound(soundId);
            card.classList.add('active');
        }
    }

    playSound(soundId) {
        console.log('Playing:', soundId);
        this.activeSounds.add(soundId);
        // In production: load and play audio file
    }

    stopSound(soundId) {
        console.log('Stopping:', soundId);
        this.activeSounds.delete(soundId);
        // In production: stop audio
    }

    adjustVolume(soundId, value) {
        console.log(`Volume ${soundId}: ${value}`);
        // In production: adjust audio volume
    }

    playAll() {
        document.querySelectorAll('.sound-card').forEach(card => {
            const soundId = card.dataset.sound;
            if (!this.activeSounds.has(soundId)) {
                this.playSound(soundId);
                card.classList.add('active');
            }
        });
    }

    stopAll() {
        this.activeSounds.forEach(soundId => this.stopSound(soundId));
        document.querySelectorAll('.sound-card').forEach(card => {
            card.classList.remove('active');
        });
    }

    startFocus() {
        const duration = parseInt(document.querySelector('.duration-btn.active').dataset.duration);
        console.log('Starting focus:', duration, 'minutes');
        // In production: start timer
    }

    stopFocus() {
        console.log('Stopping focus');
    }

    startBreathing() {
        const circle = document.getElementById('breathing-circle');
        const phase = document.getElementById('breathing-phase');
        circle?.classList.add('active');
        phase.textContent = 'Breathe...';
    }

    stopBreathing() {
        const circle = document.getElementById('breathing-circle');
        const phase = document.getElementById('breathing-phase');
        circle?.classList.remove('active');
        phase.textContent = 'Ready';
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WhiteNoiseApp();
});
