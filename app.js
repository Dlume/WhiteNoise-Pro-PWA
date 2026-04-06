// WhiteNoise Pro - Main Application (Chinese Version)
// 中文版主程序

class WhiteNoiseApp {
    constructor() {
        this.activeSounds = new Set();
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        // 初始化音频引擎
        window.audioEngine.init();
        
        // 渲染声音列表
        this.renderSounds();
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化标签页
        this.initTabs();
        
        // 初始化定时器
        if (window.TimerApp) {
            window.timerApp = new TimerApp();
        }
        
        console.log('✅ WhiteNoise Pro 已初始化');
    }

    // 渲染声音卡片
    renderSounds() {
        const grid = document.getElementById('sounds-grid');
        if (!grid) return;

        const sounds = window.SOUND_DATA.sounds;
        const filtered = this.currentCategory === 'all' 
            ? sounds 
            : sounds.filter(s => s.category === this.currentCategory);

        grid.innerHTML = filtered.map(sound => `
            <div class="sound-card" data-sound="${sound.id}">
                <div class="sound-icon">${sound.icon}</div>
                <div class="sound-name">${sound.name}</div>
                <div class="sound-category">${window.SOUND_DATA.categories[sound.category]}</div>
                <div class="sound-volume">
                    <input type="range" min="0" max="100" value="50" data-volume="${sound.id}">
                </div>
            </div>
        `).join('');
    }

    // 绑定事件
    bindEvents() {
        // 声音卡片点击
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.sound-card');
            if (card) {
                const soundId = card.dataset.sound;
                this.toggleSound(soundId, card);
            }
            
            // 分类过滤
            const filterBtn = e.target.closest('.filter-btn');
            if (filterBtn) {
                this.setCategory(filterBtn.dataset.category);
            }
        });

        // 音量控制
        document.addEventListener('input', (e) => {
            if (e.target.matches('input[type="range"]')) {
                const soundId = e.target.dataset.volume;
                window.audioEngine.setVolume(soundId, e.target.value);
            }
        });

        // 播放/停止全部
        document.getElementById('play-all')?.addEventListener('click', () => this.playAll());
        document.getElementById('stop-all')?.addEventListener('click', () => this.stopAll());

        // 专注模式
        document.getElementById('focus-play')?.addEventListener('click', () => this.startFocus());
        document.getElementById('focus-stop')?.addEventListener('click', () => this.stopFocus());

        // 呼吸练习
        document.getElementById('breathing-start')?.addEventListener('click', () => this.startBreathing());
        document.getElementById('breathing-stop')?.addEventListener('click', () => this.stopBreathing());
    }

    // 初始化标签页
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

    // 设置分类
    setCategory(category) {
        this.currentCategory = category;
        
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        // 重新渲染
        this.renderSounds();
    }

    // 切换声音
    toggleSound(soundId, card) {
        if (this.activeSounds.has(soundId)) {
            this.stopSound(soundId, card);
        } else {
            this.playSound(soundId, card);
        }
    }

    // 播放声音
    async playSound(soundId, card) {
        const soundData = window.SOUND_DATA.sounds.find(s => s.id === soundId);
        if (!soundData) return;

        // 首次播放需要初始化
        window.audioEngine.init();

        // 加载音频 (如果还没加载)
        if (!window.audioEngine.audioElements[soundId]) {
            try {
                await window.audioEngine.loadAudio(soundId, soundData.file);
            } catch (e) {
                console.error(`Failed to load ${soundId}:`, e);
                alert(`无法加载声音：${soundData.name}`);
                return;
            }
        }

        // 播放
        const success = window.audioEngine.play(soundId);
        if (success) {
            this.activeSounds.add(soundId);
            card?.classList.add('active');
            console.log(`▶️ 正在播放：${soundData.name}`);
        }
    }

    // 停止声音
    stopSound(soundId, card) {
        window.audioEngine.stop(soundId);
        this.activeSounds.delete(soundId);
        card?.classList.remove('active');
        
        const soundData = window.SOUND_DATA.sounds.find(s => s.id === soundId);
        console.log(`⏹️ 已停止：${soundData?.name || soundId}`);
    }

    // 播放全部
    playAll() {
        window.audioEngine.init();
        document.querySelectorAll('.sound-card').forEach(card => {
            const soundId = card.dataset.sound;
            if (!this.activeSounds.has(soundId)) {
                this.playSound(soundId, card);
            }
        });
    }

    // 停止全部
    stopAll() {
        window.audioEngine.stopAll();
        this.activeSounds.clear();
        document.querySelectorAll('.sound-card').forEach(card => {
            card.classList.remove('active');
        });
    }

    // 开始专注
    startFocus() {
        const duration = parseInt(document.querySelector('.duration-btn.active').dataset.duration);
        if (window.timerApp) {
            window.timerApp.start(duration);
            document.getElementById('focus-play').textContent = '⏸ 暂停';
        }
    }

    // 停止专注
    stopFocus() {
        if (window.timerApp) {
            window.timerApp.stop();
            document.getElementById('focus-play').textContent = '▶ 开始专注';
        }
    }

    // 开始呼吸练习
    startBreathing() {
        const circle = document.getElementById('breathing-circle');
        const phase = document.getElementById('breathing-phase');
        circle?.classList.add('active');
        phase.textContent = '吸气...';
        
        // 更新呼吸阶段提示
        this.updateBreathingPhase(phase);
    }

    // 停止呼吸练习
    stopBreathing() {
        const circle = document.getElementById('breathing-circle');
        const phase = document.getElementById('breathing-phase');
        circle?.classList.remove('active');
        phase.textContent = '准备';
    }

    // 更新呼吸阶段
    updateBreathingPhase(phaseElement) {
        const phases = ['吸气 (4 秒)', '屏息 (7 秒)', '呼气 (8 秒)'];
        let index = 0;
        
        const updatePhase = () => {
            phaseElement.textContent = phases[index];
            index = (index + 1) % phases.length;
        };
        
        updatePhase();
        setInterval(updatePhase, 19000); // 4+7+8 = 19 秒一个循环
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WhiteNoiseApp();
});
