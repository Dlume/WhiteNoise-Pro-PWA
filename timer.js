// WhiteNoise Pro - Timer Module (Chinese)
// 专注定时器

class TimerApp {
    constructor() {
        this.timeLeft = 25 * 60; // 25 分钟
        this.originalTime = 25 * 60;
        this.isRunning = false;
        this.intervalId = null;
        this.sessionsCompleted = 0;
        
        this.init();
    }

    init() {
        this.updateDisplay();
        
        // 加载已完成的专注次数
        const saved = localStorage.getItem('focusSessions');
        if (saved) {
            this.sessionsCompleted = parseInt(saved);
            this.updateSessionsDisplay();
        }
    }

    // 开始定时器
    start(minutes) {
        if (this.isRunning) return;
        
        this.timeLeft = minutes * 60;
        this.originalTime = minutes * 60;
        this.isRunning = true;
        
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);
        
        console.log(`⏱️ 专注开始：${minutes}分钟`);
    }

    // 计时器滴答
    tick() {
        if (this.timeLeft <= 0) {
            this.complete();
            return;
        }
        
        this.timeLeft--;
        this.updateDisplay();
    }

    // 停止定时器
    stop() {
        if (!this.isRunning) return;
        
        clearInterval(this.intervalId);
        this.isRunning = false;
        console.log('⏹️ 专注停止');
    }

    // 完成专注
    complete() {
        this.stop();
        this.sessionsCompleted++;
        localStorage.setItem('focusSessions', this.sessionsCompleted);
        this.updateSessionsDisplay();
        
        // 播放完成提示音
        this.playCompletionSound();
        
        // 显示通知
        if (Notification.permission === 'granted') {
            new Notification('专注完成！', {
                body: '恭喜你完成了一次专注练习，休息一下吧！',
                icon: 'icons/icon-192x192.png'
            });
        } else {
            alert('⏰ 专注完成！恭喜你！');
        }
        
        console.log('✅ 专注完成！次数:', this.sessionsCompleted);
    }

    // 更新显示
    updateDisplay() {
        const display = document.getElementById('focus-time');
        if (!display) return;
        
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // 更新页面标题
        document.title = `${display.textContent} - WhiteNoise Pro`;
    }

    // 更新专注次数显示
    updateSessionsDisplay() {
        const display = document.getElementById('sessions-completed');
        if (display) {
            display.textContent = this.sessionsCompleted;
        }
    }

    // 播放完成提示音
    playCompletionSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('提示音播放失败:', e);
        }
    }
}

// 请求通知权限
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// 导出类
window.TimerApp = TimerApp;
