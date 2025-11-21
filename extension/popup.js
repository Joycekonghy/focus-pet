document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading');
    const content = document.getElementById('content');
    
    try {
        // Load data from storage
        const result = await chrome.storage.local.get([
            'sessionData', 
            'dailySummary', 
            'currentPet',
            'currentEnergy',
            'currentMood',
            'lastUpdate'
        ]);
        
        // Update pet preview
        const petPreview = document.getElementById('pet-preview');
        const currentPet = result.currentPet || 'cat';
        petPreview.className = `pet-preview ${currentPet}`;
        
        // Update mood display with real data
        const currentMood = result.currentMood || 'happy';
        const currentEnergy = result.currentEnergy || 100;
        updateMoodDisplay(currentMood, currentEnergy);
        
        // Update stats
        const summary = result.dailySummary || generateDefaultSummary();
        updateStats(summary, currentEnergy);
        
        // Update recommendations based on energy and mood
        updateRecommendations(getEnergyMoodRecommendations(currentEnergy, currentMood));
        
        // Show content
        loading.style.display = 'none';
        content.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading popup data:', error);
        showError();
    }
    
    // Bind events
    bindEvents();
});

function updateMoodDisplay(mood, energy) {
    const moodEmoji = document.getElementById('mood-emoji');
    const moodText = document.getElementById('mood-text');
    
    const moodMap = {
        exhausted: { emoji: '😴', text: 'Exhausted' },
        tired: { emoji: '😪', text: 'Tired' },
        focused: { emoji: '🎯', text: 'Focused' },
        excited: { emoji: '😄', text: 'Excited' },
        happy: { emoji: '😊', text: 'Happy' },
        neutral: { emoji: '😐', text: 'Neutral' },
        distracted: { emoji: '😵', text: 'Distracted' }
    };
    
    const moodData = moodMap[mood] || moodMap.happy;
    moodEmoji.textContent = moodData.emoji;
    moodText.textContent = `${moodData.text} (${Math.round(energy)}% energy)`;
}

function updateStats(summary, energy) {
    document.getElementById('session-time').textContent = summary.sessionTime || '0h 0m';
    document.getElementById('sites-count').textContent = summary.totalSites || 0;
    
    const topSite = summary.topSites && summary.topSites[0] 
        ? `${summary.topSites[0].site} (${summary.topSites[0].time}m)`
        : 'None';
    document.getElementById('top-site').textContent = topSite;
}

function getEnergyMoodRecommendations(energy, mood) {
    if (energy < 20) {
        return ['Take a break!', 'Step away from screen', 'Get some fresh air'];
    } else if (energy < 40) {
        return ['Consider a short break', 'Drink some water', 'Stretch a bit'];
    } else if (mood === 'distracted') {
        return ['Focus on one task', 'Close distracting tabs', 'Use a productivity site'];
    } else if (mood === 'focused') {
        return ['Great focus!', 'Keep up the momentum', 'You\'re in the zone!'];
    } else {
        return ['Keep browsing mindfully!', 'Stay hydrated', 'Take breaks when needed'];
    }
}

function updateRecommendations(recommendations) {
    const list = document.getElementById('recommendations-list');
    list.innerHTML = '';
    
    (recommendations || ['Keep browsing mindfully!']).forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        list.appendChild(li);
    });
}

function generateDefaultSummary() {
    return {
        mood: 'neutral',
        totalSites: 0,
        sessionTime: '0h 0m',
        topSites: [],
        recommendations: ['Start browsing to see your pet react!']
    };
}

function showError() {
    const loading = document.getElementById('loading');
    loading.textContent = 'Error loading pet data';
    loading.style.color = '#e74c3c';
}

function bindEvents() {
    // Configure button - opens website
    document.getElementById('configure-btn').addEventListener('click', () => {
        chrome.tabs.create({ 
            url: 'http://localhost:3000' // Your website URL
        });
        window.close();
    });
    
    // Reset button - clears session data
    document.getElementById('reset-btn').addEventListener('click', async () => {
        if (confirm('Reset your pet session data?')) {
            await chrome.storage.local.clear();
            
            // Reload popup
            location.reload();
        }
    });
    
    // Pet preview click - cycle through pets
    document.getElementById('pet-preview').addEventListener('click', async () => {
        const pets = ['cat', 'dog', 'dragon'];
        const current = await chrome.storage.local.get(['currentPet']);
        const currentPet = current.currentPet || 'cat';
        const currentIndex = pets.indexOf(currentPet);
        const nextPet = pets[(currentIndex + 1) % pets.length];
        
        // Update storage
        await chrome.storage.local.set({ currentPet: nextPet });
        
        // Update preview
        const petPreview = document.getElementById('pet-preview');
        petPreview.className = `pet-preview ${nextPet}`;
        
        // Notify content scripts to update
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    });
}
