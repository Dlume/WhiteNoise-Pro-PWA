/**
 * WhiteNoise Pro v4.0 - Audio Data
 * Sound definitions, metadata, and generation parameters
 */

const AudioData = {
    // Original 7 sounds
    rain: {
        id: 'rain',
        name: 'Rain',
        icon: '🌧️',
        category: 'weather',
        color: '#4a9eff',
        description: 'Gentle rain falling',
        file: 'rain.m4a',
        defaultVolume: 0.5
    },
    
    ocean: {
        id: 'ocean',
        name: 'Ocean',
        icon: '🌊',
        category: 'water',
        color: '#2196f3',
        description: 'Ocean waves on shore',
        file: 'ocean.m4a',
        defaultVolume: 0.5
    },
    
    forest: {
        id: 'forest',
        name: 'Forest',
        icon: '🌲',
        category: 'nature',
        color: '#4caf50',
        description: 'Forest ambience',
        file: 'forest.m4a',
        defaultVolume: 0.5
    },
    
    cafe: {
        id: 'cafe',
        name: 'Café',
        icon: '☕',
        category: 'ambient',
        color: '#795548',
        description: 'Coffee shop ambience',
        file: 'cafe.m4a',
        defaultVolume: 0.4
    },
    
    thunder: {
        id: 'thunder',
        name: 'Thunder',
        icon: '⚡',
        category: 'weather',
        color: '#ff9800',
        description: 'Distant thunder',
        file: 'thunder.m4a',
        defaultVolume: 0.4
    },
    
    wind: {
        id: 'wind',
        name: 'Wind',
        icon: '💨',
        category: 'weather',
        color: '#9e9e9e',
        description: 'Gentle breeze',
        file: 'wind.m4a',
        defaultVolume: 0.4
    },
    
    fireplace: {
        id: 'fireplace',
        name: 'Fireplace',
        icon: '🔥',
        category: 'ambient',
        color: '#f44336',
        description: 'Crackling fire',
        file: 'fireplace.m4a',
        defaultVolume: 0.5
    },
    
    // New 8 sounds (v4.0)
    stream: {
        id: 'stream',
        name: 'Stream',
        icon: '🏞️',
        category: 'water',
        color: '#00bcd4',
        description: 'Flowing stream',
        file: 'stream.m4a',
        defaultVolume: 0.5
    },
    
    birds: {
        id: 'birds',
        name: 'Birds',
        icon: '🐦',
        category: 'nature',
        color: '#8bc34a',
        description: 'Morning birdsong',
        file: 'birds.m4a',
        defaultVolume: 0.4
    },
    
    night: {
        id: 'night',
        name: 'Night',
        icon: '🌙',
        category: 'ambient',
        color: '#3f51b5',
        description: 'Night sounds',
        file: 'night.m4a',
        defaultVolume: 0.3
    },
    
    meditation: {
        id: 'meditation',
        name: 'Meditation',
        icon: '🧘',
        category: 'wellness',
        color: '#9c27b0',
        description: 'Meditation bowl',
        file: 'meditation.m4a',
        defaultVolume: 0.4
    },
    
    whiteNoise: {
        id: 'white-noise',
        name: 'White Noise',
        icon: '⚪',
        category: 'noise',
        color: '#e0e0e0',
        description: 'Classic white noise',
        file: 'white-noise.m4a',
        defaultVolume: 0.5
    },
    
    pinkNoise: {
        id: 'pink-noise',
        name: 'Pink Noise',
        icon: '🌸',
        category: 'noise',
        color: '#f48fb1',
        description: 'Soothing pink noise',
        file: 'pink-noise.m4a',
        defaultVolume: 0.5
    },
    
    brownNoise: {
        id: 'brown-noise',
        name: 'Brown Noise',
        icon: '🟤',
        category: 'noise',
        color: '#8d6e63',
        description: 'Deep brown noise',
        file: 'brown-noise.m4a',
        defaultVolume: 0.5
    },
    
    clouds: {
        id: 'clouds',
        name: 'Clouds',
        icon: '☁️',
        category: 'weather',
        color: '#cfd8dc',
        description: 'Ethereal clouds',
        file: 'clouds.m4a',
        defaultVolume: 0.4
    }
};

/**
 * Get Sound by ID
 * @param {string} soundId - Sound identifier
 * @returns {Object|null} Sound data or null
 */
function getSound(soundId) {
    return AudioData[soundId] || null;
}

/**
 * Get All Sounds
 * @returns {Array<Object>} List of all sounds
 */
function getAllSounds() {
    return Object.values(AudioData);
}

/**
 * Get Sounds by Category
 * @param {string} category - Category name
 * @returns {Array<Object>} Filtered sounds
 */
function getSoundsByCategory(category) {
    return Object.values(AudioData).filter(sound => sound.category === category);
}

/**
 * Get All Categories
 * @returns {Array<string>} Unique categories
 */
function getCategories() {
    const categories = new Set();
    Object.values(AudioData).forEach(sound => {
        categories.add(sound.category);
    });
    return Array.from(categories);
}

/**
 * Search Sounds
 * @param {string} query - Search query
 * @returns {Array<Object>} Matching sounds
 */
function searchSounds(query) {
    const lowerQuery = query.toLowerCase();
    
    return Object.values(AudioData).filter(sound => {
        return sound.name.toLowerCase().includes(lowerQuery) ||
               sound.description.toLowerCase().includes(lowerQuery) ||
               sound.category.toLowerCase().includes(lowerQuery);
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AudioData,
        getSound,
        getAllSounds,
        getSoundsByCategory,
        getCategories,
        searchSounds
    };
}
