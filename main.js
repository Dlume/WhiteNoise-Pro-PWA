/**
 * WhiteNoise Pro v3.8 - Main Entry Point
 * Final Fix - Clean UI + Sound Management
 */

// Sound Configuration
const SOUND_LIST = [
    { id: 'rain', name: 'Rain', icon: '🌧' },
    { id: 'ocean', name: 'Ocean', icon: '🌊' },
    { id: 'forest', name: 'Forest', icon: '🌲' },
    { id: 'cafe', name: 'Cafe', icon: '☕' },
    { id: 'thunder', name: 'Thunder', icon: '⚡' },
    { id: 'wind', name: 'Wind', icon: '💨' },
    { id: 'fireplace', name: 'Fireplace', icon: '🔥' }
];

// Global State
let selectedSounds = [];
let audioManager = null;
let focusTimer = null;
let breathingExercise = null;

/**
 * Initialize Application
 */
function initApp() {
    console.log('[INFO] WhiteNoise Pro v3.8 Starting...');
    console.log('[DEBUG] PWAAudioManager exists:', typeof PWAAudioManager);
    console.log('[DEBUG] sounds-grid exists:', !!document.getElementById('sounds-grid'));
    
    // Initialize Audio Manager
    audioManager = new PWAAudioManager();
    audioManager.initializeSounds(SOUND_LIST.map(s => s.id));
    
    // Render Sound Cards
    renderSoundCards();
    
    // Bind Events
    bindEvents();
    
    // Initialize Focus Mode
    initFocusMode();
    
    // Initialize Breathing
    initBreathing();
    
    // Initialize Tabs
    initTabs();
    
    console.log('[OK] Application Initialized');
    console.log('[DEBUG] Sound cards rendered:', document.getElementById('sounds-grid').childElementCount);
}

/**
 * Render Sound Cards
 */
function renderSoundCards() {
    const grid = document.getElementById('sounds-grid');
    console.log('[DEBUG] renderSoundCards called, grid:', !!grid);
    if (!grid) return;
    
    grid.innerHTML = SOUND_LIST.map(sound => `
        <div class="sound-card" data-sound="${sound.id}">
            <div class="sound-card-content">
                <span class="sound-icon">${sound.icon}</span>
                <h3 class="sound-name">${sound.name}</h3>
                <p class="sound-status">Click to play</p>
                <div class="volume-control">
                    <input type="range" class="volume-slider" 
                           min="0" max="100" value="50"
                           data-sound="${sound.id}"
                           onclick="event.stopPropagation()">
                </div>
            </div>
        </div>
    `).join('');
    
    // Bind card click events
    grid.querySelectorAll('.sound-card').forEach(card => {
        card.addEventListener('click', () => toggleSound(card));
    });
    
    // Bind volume slider events
    grid.querySelectorAll('.volume-slider').forEach(slider => {
        slider.addEventListener('input', (e) => updateVolume(e));
    });
}

/**
 * Toggle Sound Playback
 */
function toggleSound(card) {
    const soundId = card.dataset.sound;
    const status = card.querySelector('.sound-status');
    
    if (card.classList.contains('active')) {
        audioManager.stopSound(soundId);
        card.classList.remove('active', 'active-playing');
        status.textContent = 'Click to play';
        selectedSounds = selectedSounds.filter(s => s !== soundId);
    } else {
        const volume = card.querySelector('.volume-slider').value / 100;
        audioManager.playSound(soundId, volume);
        card.classList.add('active', 'active-playing');
        status.textContent = 'Playing';
        if (!selectedSounds.includes(soundId)) {
            selectedSounds.push(soundId);
        }
    }
}

/**
 * Update Volume
 */
function updateVolume(e) {
    const soundId = e.target.dataset.sound;
    const volume = e.target.value / 100;
    audioManager.setVolume(soundId, volume);
}

/**
 * Bind Events
 */
function bindEvents() {
    const playAllBtn = document.getElementById('play-all');
    if (playAllBtn) {
        playAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.sound-card').forEach(card => {
                if (!card.classList.contains('active')) {
                    toggleSound(card);
                }
            });
        });
    }
    
    const stopAllBtn = document.getElementById('stop-all');
    if (stopAllBtn) {
        stopAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.sound-card').forEach(card => {
                if (card.classList.contains('active')) {
                    toggleSound(card);
                }
            });
        });
    }
}

/**
 * Initialize Tabs
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabContents.forEach(content => {
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                    content.style.display = 'block';
                } else {
                    content.classList.remove('active');
                    content.style.display = 'none';
                }
            });
        });
    });
}

/**
 * Initialize Focus Mode
 */
function initFocusMode() {
    let timeLeft = 25 * 60;
    const timerDisplay = document.getElementById('focus-time');
    if (timerDisplay) {
        timerDisplay.textContent = '25:00';
    }
}

/**
 * Initialize Breathing
 */
function initBreathing() {
    const phaseElement = document.getElementById('breathing-phase');
    if (phaseElement) {
        phaseElement.textContent = 'Ready';
    }
}

// Execute immediately
console.log('[DEBUG] main.js v3.8 loaded');
if (typeof PWAAudioManager !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
} else {
    console.error('[ERROR] PWAAudioManager not defined!');
}
