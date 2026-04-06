// WhiteNoise Pro - Audio Data Configuration
// 音频文件配置 - 中文界面 + 真实音频路径

window.SOUND_DATA = {
    sounds: [
        // 雨声类
        { id: 'light-rain', name: '小雨', icon: '🌧️', category: 'rain', file: 'assets/audio/rain/light-rain.mp3' },
        { id: 'heavy-rain', name: '大雨', icon: '⛈️', category: 'rain', file: 'assets/audio/rain/heavy-rain.mp3' },
        { id: 'rain-on-roof', name: '屋檐雨声', icon: '🏠', category: 'rain', file: 'assets/audio/rain/rain-on-roof.mp3' },
        { id: 'rain-thunder', name: '雷雨', icon: '⚡', category: 'rain', file: 'assets/audio/rain/rain-thunder.mp3' },
        { id: 'rain-window', name: '窗边雨声', icon: '🪟', category: 'rain', file: 'assets/audio/rain/rain-window.mp3' },
        { id: 'tropical-rain', name: '热带雨林', icon: '🌴', category: 'rain', file: 'assets/audio/rain/tropical-rain.mp3' },
        { id: 'rain-puddle', name: '雨滴积水', icon: '💧', category: 'rain', file: 'assets/audio/rain/rain-puddle.mp3' },
        
        // 水声类
        { id: 'ocean-waves', name: '海浪', icon: '🌊', category: 'water', file: 'assets/audio/water/ocean-waves.mp3' },
        { id: 'river-flow', name: '河流', icon: '🏞️', category: 'water', file: 'assets/audio/water/river-flow.mp3' },
        { id: 'waterfall', name: '瀑布', icon: '💦', category: 'water', file: 'assets/audio/water/waterfall.mp3' },
        { id: 'lake-shore', name: '湖畔', icon: '🏖️', category: 'water', file: 'assets/audio/water/lake-shore.mp3' },
        { id: 'stream-brook', name: '小溪', icon: '💨', category: 'water', file: 'assets/audio/water/stream-brook.mp3' },
        { id: 'rain-creek', name: '雨溪', icon: '🌦️', category: 'water', file: 'assets/audio/water/rain-creek.mp3' },
        { id: 'water-fountain', name: '喷泉', icon: '⛲', category: 'water', file: 'assets/audio/water/water-fountain.mp3' },
        
        // 自然类
        { id: 'forest-wind', name: '森林风', icon: '🌲', category: 'nature', file: 'assets/audio/nature/forest-wind.mp3' },
        { id: 'birds-morning', name: '晨鸟', icon: '🐦', category: 'nature', file: 'assets/audio/nature/birds-morning.mp3' },
        { id: 'crickets-night', name: '夜虫', icon: '🦗', category: 'nature', file: 'assets/audio/nature/crickets-night.mp3' },
        { id: 'wind-leaves', name: '风吹树叶', icon: '🍃', category: 'nature', file: 'assets/audio/nature/wind-leaves.mp3' },
        { id: 'meadow-summer', name: '夏日草地', icon: '🌻', category: 'nature', file: 'assets/audio/nature/meadow-summer.mp3' },
        { id: 'mountain-breeze', name: '山间清风', icon: '⛰️', category: 'nature', file: 'assets/audio/nature/mountain-breeze.mp3' },
        { id: 'bamboo-forest', name: '竹林', icon: '🎋', category: 'nature', file: 'assets/audio/nature/bamboo-forest.mp3' },
        
        // 城巿类
        { id: 'cafe-ambient', name: '咖啡馆', icon: '☕', category: 'urban', file: 'assets/audio/urban/cafe-ambient.mp3' },
        { id: 'train-distant', name: '远处火车', icon: '🚂', category: 'urban', file: 'assets/audio/urban/train-distant.mp3' },
        { id: 'city-night', name: '城市夜晚', icon: '🌃', category: 'urban', file: 'assets/audio/urban/city-night.mp3' },
        { id: 'library-quiet', name: '图书馆', icon: '📚', category: 'urban', file: 'assets/audio/urban/library-quiet.mp3' },
        { id: 'office-hum', name: '办公室', icon: '💼', category: 'urban', file: 'assets/audio/urban/office-hum.mp3' },
        { id: 'subway-distant', name: '远处地铁', icon: '🚇', category: 'urban', file: 'assets/audio/urban/subway-distant.mp3' },
        { id: 'restaurant-background', name: '餐厅背景', icon: '🍽️', category: 'urban', file: 'assets/audio/urban/restaurant-background.mp3' },
        
        // 白噪音类
        { id: 'white-noise-smooth', name: '平滑白噪', icon: '⚪', category: 'white-noise', file: 'assets/audio/white-noise/white-noise-smooth.mp3' },
        { id: 'pink-noise', name: '粉红噪音', icon: '🌸', category: 'white-noise', file: 'assets/audio/white-noise/pink-noise.mp3' },
        { id: 'brown-noise', name: '布朗噪音', icon: '🟤', category: 'white-noise', file: 'assets/audio/white-noise/brown-noise.mp3' },
        { id: 'fan-sound', name: '风扇', icon: '💨', category: 'white-noise', file: 'assets/audio/white-noise/fan-sound.mp3' },
        { id: 'air-purifier', name: '空气净化器', icon: '🌀', category: 'white-noise', file: 'assets/audio/white-noise/air-purifier.mp3' },
        { id: 'static-soft', name: '柔和静电', icon: '📻', category: 'white-noise', file: 'assets/audio/white-noise/static-soft.mp3' }
    ],
    
    categories: {
        'all': '全部',
        'rain': '🌧️ 雨声',
        'water': '💧 水声',
        'nature': '🌲 自然',
        'urban': '🏙️ 城市',
        'white-noise': '⚪ 白噪音'
    }
};
