/**
 * WhiteNoise Pro - 主程序入口
 * 处理 UI 交互和音效管理
 */

// 音效列表配置
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
let isPlaying = false;
let breathingExercise = null;

/**
 * 初始化应用
 */
function initApp() {
    console.log('[INFO] WhiteNoise Pro 启动中...');
    
    // 初始化音效
    audioManager.initializeSounds(SOUND_LIST.map(s => s.id));
    
    // 渲染音效卡片
    renderSoundCards();
    
    // 绑定事件
    bindEvents();
    
    // 初始化专注模式
    if (typeof initFocusMode === 'function') {
        initFocusMode();
    }
    
    // 初始化呼吸练习
    initBreathing();
    
    console.log('[OK] 应用初始化完成');
}

/**
 * 渲染音效卡片
 */
function renderSoundCards() {
    const grid = document.getElementById('sound-grid');
    if (!grid) return;
    
    grid.innerHTML = SOUND_LIST.map(sound => `
        <div class="sound-card" data-sound="${sound.id}">
            <div class="sound-icon">${sound.icon}</div>
            <div class="sound-name">${sound.name}</div>
            <input type="range" class="volume-slider" 
                   min="0" max="100" value="50"
                   data-sound="${sound.id}"
                   onclick="event.stopPropagation()">
        </div>
    `).join('');
}

/**
 * 绑定事件处理器
 */
function bindEvents() {
    // 标签页切换
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', handleTabSwitch);
    });
    
    // 音效卡片点击
    document.getElementById('sound-grid').addEventListener('click', handleSoundCardClick);
    
    // 音量滑块
    document.getElementById('sound-grid').addEventListener('input', handleVolumeChange);
    
    // 播放/停止按钮
    document.getElementById('play-btn').addEventListener('click', handlePlay);
    document.getElementById('stop-btn').addEventListener('click', handleStop);
    
    // 用户手势激活（iOS 后台播放必需）
    document.body.addEventListener('touchstart', activateAudioContext, { once: true });
    document.body.addEventListener('click', activateAudioContext, { once: true });
}

/**
 * 处理标签页切换
 */
function handleTabSwitch(e) {
    const tabId = e.target.dataset.tab;
    
    // 更新按钮状态
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // 更新内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

/**
 * 处理音效卡片点击
 */
function handleSoundCardClick(e) {
    const card = e.target.closest('.sound-card');
    if (!card) return;
    
    const soundId = card.dataset.sound;
    toggleSound(soundId, card);
}

/**
 * 切换音效播放状态
 */
function toggleSound(soundId, card) {
    const index = selectedSounds.indexOf(soundId);
    
    if (index > -1) {
        // 停止播放
        audioManager.stopSound(soundId);
        selectedSounds.splice(index, 1);
        card.classList.remove('playing');
    } else {
        // 开始播放
        audioManager.playSound(soundId, 0.5);
        selectedSounds.push(soundId);
        card.classList.add('playing');
    }
    
    updatePlayButton();
}

/**
 * 处理音量变化
 */
function handleVolumeChange(e) {
    if (!e.target.classList.contains('volume-slider')) return;
    
    const soundId = e.target.dataset.sound;
    const volume = e.target.value / 100;
    audioManager.setVolume(soundId, volume);
}

/**
 * 处理播放按钮
 */
function handlePlay() {
    try {
        if (selectedSounds.length === 0) {
            alert('请先选择音效！');
            return;
        }
        
        selectedSounds.forEach(soundId => {
            audioManager.playSound(soundId, audioManager.getVolume(soundId));
        });
        
        isPlaying = true;
        updatePlayButton();
        
        // 标记所有选中的卡片为播放状态
        document.querySelectorAll('.sound-card.playing').forEach(card => {
            card.classList.add('active-playing');
        });
    } catch (error) {
        console.error('[ERROR] 播放失败:', error);
        alert('播放时出错，请重试');
    }
}

/**
 * 处理停止按钮
 */
function handleStop() {
    try {
        audioManager.stopAll();
        isPlaying = false;
        updatePlayButton();
        
        // 移除所有卡片的播放状态
        document.querySelectorAll('.sound-card').forEach(card => {
            card.classList.remove('active-playing');
        });
    } catch (error) {
        console.error('[ERROR] 停止失败:', error);
    }
}

/**
 * 更新播放按钮状态
 */
function updatePlayButton() {
    const playBtn = document.getElementById('play-btn');
    if (isPlaying) {
        playBtn.textContent = '⏸';
        playBtn.classList.add('playing');
    } else {
        playBtn.textContent = '▶';
        playBtn.classList.remove('playing');
    }
}

/**
 * 激活音频上下文（iOS 后台播放必需）
 */
function activateAudioContext() {
    console.log('[INFO] 音频上下文已激活');
}

/**
 * 初始化呼吸练习
 * 4-7-8 呼吸法：吸气 4 秒，屏息 7 秒，呼气 8 秒
 */
function initBreathing() {
    console.log('[INFO] 初始化呼吸练习 (4-7-8 呼吸法)...');
    
    breathingExercise = new BreathingExercise();
    // 呼吸节奏：inhale=4s, hold=7s, exhale=8s
    
    const startBtn = document.getElementById('breathing-start');
    const stopBtn = document.getElementById('breathing-stop');
    const circle = document.getElementById('breathing-circle');
    const phaseText = document.getElementById('breathing-phase');
    
    if (!startBtn || !stopBtn || !circle || !phaseText) {
        console.log('[WARN] 呼吸练习元素缺失');
        return;
    }
    
    // 开始按钮
    startBtn.addEventListener('click', () => {
        if (breathingExercise.isRunning) return;
        
        breathingExercise.start();
        startBtn.textContent = '运行中...';
        startBtn.disabled = true;
        
        // 更新 UI
        updateBreathingUI();
    });
    
    // 停止按钮
    stopBtn.addEventListener('click', () => {
        breathingExercise.stop();
        startBtn.textContent = '开始';
        startBtn.disabled = false;
        circle.className = 'breathing-circle';
        phaseText.textContent = '准备';
    });
    
    // 定时更新 UI
    setInterval(() => {
        if (breathingExercise && breathingExercise.isRunning) {
            updateBreathingUI();
        }
    }, 100);
    
    console.log('[OK] 呼吸练习初始化完成');
}

/**
 * 更新呼吸练习 UI
 */
function updateBreathingUI() {
    const circle = document.getElementById('breathing-circle');
    const phaseText = document.getElementById('breathing-phase');
    
    if (!breathingExercise || !circle || !phaseText) return;
    
    const phase = breathingExercise.currentPhase;
    circle.className = 'breathing-circle ' + phase;
    phaseText.textContent = breathingExercise.getPhaseText();
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
