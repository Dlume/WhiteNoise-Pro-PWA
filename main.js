/**
 * WhiteNoise Pro v3.0 - 主程序入口
 * 优化界面交互 + 音效管理
 */

// 音效配置
const SOUND_LIST = [
    { id: 'rain', name: '雨声', icon: '🌧️' },
    { id: 'ocean', name: '海浪', icon: '🌊' },
    { id: 'forest', name: '森林', icon: '🌲' },
    { id: 'cafe', name: '咖啡厅', icon: '☕' },
    { id: 'thunder', name: '雷声', icon: '⚡' },
    { id: 'wind', name: '风声', icon: '💨' },
    { id: 'fireplace', name: '篝火', icon: '🔥' }
];

// 全局状态
let selectedSounds = [];
let audioManager = null;
let focusTimer = null;
let breathingExercise = null;

/**
 * 初始化应用
 */
function initApp() {
    console.log('[INFO] WhiteNoise Pro v3.0 启动中...');
    
    // 初始化音频管理器
    audioManager = new PWAAudioManager();
    audioManager.initializeSounds(SOUND_LIST.map(s => s.id));
    
    // 渲染音效卡片
    renderSoundCards();
    
    // 绑定事件
    bindEvents();
    
    // 初始化专注模式
    initFocusMode();
    
    // 初始化呼吸练习
    initBreathing();
    
    // 初始化标签页
    initTabs();
    
    console.log('[OK] 应用初始化完成');
}

/**
 * 渲染音效卡片
 */
function renderSoundCards() {
    const grid = document.getElementById('sounds-grid');
    if (!grid) return;
    
    grid.innerHTML = SOUND_LIST.map(sound => `
        <div class="sound-card" data-sound="${sound.id}">
            <div class="sound-card-content">
                <span class="sound-icon">${sound.icon}</span>
                <h3 class="sound-name">${sound.name}</h3>
                <p class="sound-status">点击播放</p>
                <div class="volume-control">
                    <input type="range" class="volume-slider" 
                           min="0" max="100" value="50"
                           data-sound="${sound.id}"
                           onclick="event.stopPropagation()">
                </div>
            </div>
        </div>
    `).join('');
    
    // 绑定卡片点击事件
    grid.querySelectorAll('.sound-card').forEach(card => {
        card.addEventListener('click', () => toggleSound(card));
    });
    
    // 绑定音量滑块事件
    grid.querySelectorAll('.volume-slider').forEach(slider => {
        slider.addEventListener('input', (e) => updateVolume(e));
    });
}

/**
 * 切换音效播放
 */
function toggleSound(card) {
    const soundId = card.dataset.sound;
    const status = card.querySelector('.sound-status');
    
    if (card.classList.contains('active')) {
        // 停止播放
        audioManager.stopSound(soundId);
        card.classList.remove('active', 'active-playing');
        status.textContent = '点击播放';
        selectedSounds = selectedSounds.filter(s => s !== soundId);
    } else {
        // 开始播放
        const volume = card.querySelector('.volume-slider').value / 100;
        audioManager.playSound(soundId, volume);
        card.classList.add('active', 'active-playing');
        status.textContent = '播放中...';
        if (!selectedSounds.includes(soundId)) {
            selectedSounds.push(soundId);
        }
    }
}

/**
 * 更新音量
 */
function updateVolume(e) {
    const soundId = e.target.dataset.sound;
    const volume = e.target.value / 100;
    audioManager.setVolume(soundId, volume);
}

/**
 * 绑定全局事件
 */
function bindEvents() {
    // 全部播放
    document.getElementById('play-all')?.addEventListener('click', () => {
        document.querySelectorAll('.sound-card').forEach(card => {
            if (!card.classList.contains('active')) {
                toggleSound(card);
            }
        });
    });
    
    // 停止全部
    document.getElementById('stop-all')?.addEventListener('click', () => {
        document.querySelectorAll('.sound-card').forEach(card => {
            if (card.classList.contains('active')) {
                toggleSound(card);
            }
        });
    });
}

/**
 * 初始化标签页
 */
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有激活状态
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            
            // 激活当前标签
            btn.classList.add('active');
            const tabId = btn.dataset.tab + '-tab';
            document.getElementById(tabId).style.display = 'block';
        });
    });
}

/**
 * 初始化专注模式
 */
function initFocusMode() {
    focusTimer = new FocusTimer();
    
    const startBtn = document.getElementById('timer-start');
    const resetBtn = document.getElementById('timer-reset');
    const display = document.getElementById('timer-display');
    
    if (!startBtn || !resetBtn || !display) return;
    
    startBtn.addEventListener('click', () => {
        if (focusTimer.isRunning) {
            focusTimer.pause();
            startBtn.textContent = '继续';
        } else {
            focusTimer.start();
            startBtn.textContent = '暂停';
        }
    });
    
    resetBtn.addEventListener('click', () => {
        focusTimer.reset();
        startBtn.textContent = '开始';
        display.textContent = '25:00';
    });
    
    // 更新时间显示
    focusTimer.onUpdate = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
}

/**
 * 初始化呼吸练习
 */
function initBreathing() {
    breathingExercise = new BreathingExercise();
    
    const startBtn = document.getElementById('breathing-start');
    const stopBtn = document.getElementById('breathing-stop');
    const phaseText = document.getElementById('breathing-phase');
    const instruction = document.getElementById('breathing-instruction');
    
    if (!startBtn || !stopBtn || !phaseText) return;
    
    startBtn.addEventListener('click', () => {
        if (breathingExercise.isRunning) return;
        
        breathingExercise.start();
        startBtn.textContent = '练习中...';
        startBtn.disabled = true;
        
        // 更新阶段显示
        breathingExercise.onPhaseChange = (phase) => {
            const phases = {
                'inhale': { text: '吸气', instruction: '深深吸气 4 秒' },
                'hold': { text: '屏息', instruction: '保持呼吸 7 秒' },
                'exhale': { text: '呼气', instruction: '缓慢呼气 8 秒' }
            };
            phaseText.textContent = phases[phase]?.text || phase;
            instruction.textContent = phases[phase]?.instruction || '';
        };
    });
    
    stopBtn.addEventListener('click', () => {
        breathingExercise.stop();
        startBtn.textContent = '开始练习';
        startBtn.disabled = false;
        phaseText.textContent = '准备';
        instruction.textContent = '吸气 4 秒 · 屏息 7 秒 · 呼气 8 秒';
    });
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
