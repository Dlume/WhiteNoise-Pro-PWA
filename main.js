/**
 * WhiteNoise Pro v3.4 - Main Entry Point
 * Clean UI + Sound Management (No Emoji)
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
    console.log('[INFO] WhiteNoise Pro v3.4 Starting...');
    
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
}

/**
 * Render Sound Cards
 */
function renderSoundCards() {
    const grid = document.getElementById('sounds-grid');
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
        // Stop playback
        audioManager.stopSound(soundId);
        card.classList.remove('active', 'active-playing');
        status.textContent = 'Click to play';
        selectedSounds = selectedSounds.filter(s => s !== soundId);
    } else {
        // Start playback
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
    // Play All
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
    
    // Stop All
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
            
            // Update buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update contents
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
    let isRunning = false;
    let isWorkTime = true;
    
    const timerDisplay = document.getElementById('focus-time');
    const focusModeEl = document.getElementById('focus-mode');
    
    function updateDisplay() {
        if (timerDisplay) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateDisplay();
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

// Initialize immediately (DOM should be ready)
console.log('[DEBUG] main.js loaded, calling initApp...');
if (typeof PWAAudioManager !== 'undefined') {
    initApp();
} else {
    console.error('[ERROR] PWAAudioManager not found!');
}
