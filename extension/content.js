class FocusPet {
    constructor() {
        this.pet = null;
        this.currentSite = window.location.hostname;
        this.startTime = Date.now();
        this.isActive = true;
        this.energy = 100;
        this.mood = 'happy';
        this.sessionStartTime = Date.now();
        this.lastActivityTime = Date.now();
        this.config = {
            pet: 'cat',
            reactions: [],
            customAvatar: null
        };
        
        this.init();
    }

    async init() {
        await this.loadConfig();
        this.createPet();
        this.startTracking();
        this.bindEvents();
    }

    async loadConfig() {
        // Load from Chrome storage (synced from website)
        try {
            const result = await chrome.storage.local.get([
                'currentPet', 
                'siteReactions', 
                'customAvatar',
                'aiAnimations'
            ]);
            this.config.pet = result.currentPet || 'cat';
            this.config.reactions = result.siteReactions || [];
            this.config.customAvatar = result.customAvatar;
            this.config.aiAnimations = result.aiAnimations || [];
            
            // Also try to sync from website if available
            this.syncFromWebsite();
        } catch (error) {
            console.log('Using default pet config');
        }
    }

    async syncFromWebsite() {
        // Check if user has configured pet on website
        try {
            const websiteConfig = localStorage.getItem('currentPet');
            if (websiteConfig) {
                // Sync website config to extension storage
                const siteReactions = JSON.parse(localStorage.getItem('siteReactions') || '[]');
                const customAvatar = localStorage.getItem('customAvatar');
                
                await chrome.storage.local.set({
                    currentPet: websiteConfig,
                    siteReactions: siteReactions,
                    customAvatar: customAvatar
                });
                
                // Update current config
                this.config.pet = websiteConfig;
                this.config.reactions = siteReactions;
                this.config.customAvatar = customAvatar;
            }
        } catch (error) {
            // Website sync failed, use extension storage
        }
    }

    createPet() {
        // Remove existing pet
        const existing = document.getElementById('focus-pet');
        if (existing) existing.remove();

        // Create pet container
        this.pet = document.createElement('div');
        this.pet.id = 'focus-pet';
        this.pet.className = `focus-pet ${this.config.pet} idle`;
        
        // Add custom avatar if available
        if (this.config.customAvatar) {
            this.pet.style.backgroundImage = `url(${this.config.customAvatar})`;
            this.pet.classList.add('custom');
        }

        // Position pet
        this.pet.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            z-index: 10000;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        document.body.appendChild(this.pet);
        
        // Apply site-specific reaction
        this.applySiteReaction();
    }

    applySiteReaction() {
        const siteReaction = this.config.reactions.find(r => 
            this.currentSite.includes(r.site) || r.site.includes(this.currentSite)
        );

        if (siteReaction) {
            this.setPetState(siteReaction.reaction);
        } else {
            // Default reactions based on common sites
            if (this.currentSite.includes('youtube')) {
                this.setPetState('headphones');
            } else if (this.currentSite.includes('twitter') || this.currentSite.includes('facebook')) {
                this.setPetState('excited');
            } else if (this.currentSite.includes('docs.google') || this.currentSite.includes('notion')) {
                this.setPetState('happy');
            } else {
                this.setPetState('idle');
            }
        }
    }

    setPetState(state) {
        if (!this.pet) return;
        
        // Remove all state classes
        this.pet.classList.remove('idle', 'happy', 'sleepy', 'excited', 'headphones');
        
        // Add new state
        this.pet.classList.add(state);
        
        // Send tracking data
        this.trackBehavior(state);
    }

    startTracking() {
        // Update energy and mood every minute
        setInterval(() => {
            this.updateEnergyAndMood();
        }, 60000);

        // Track time on site
        setInterval(() => {
            if (this.isActive) {
                const timeSpent = Date.now() - this.startTime;
                
                // Change pet state based on time spent and energy
                if (this.energy < 20) {
                    this.setPetState('sleepy');
                } else if (timeSpent > 30 * 60 * 1000) { // 30 minutes
                    this.setPetState('tired');
                } else if (timeSpent > 10 * 60 * 1000) { // 10 minutes
                    if (this.isProductiveSite()) {
                        this.setPetState('focused');
                    } else {
                        this.setPetState('bored');
                    }
                }
            }
        }, 60000); // Check every minute

        // Track user activity
        let inactiveTimer;
        const resetInactiveTimer = () => {
            clearTimeout(inactiveTimer);
            this.isActive = true;
            this.lastActivityTime = Date.now();
            
            inactiveTimer = setTimeout(() => {
                this.isActive = false;
                this.setPetState('sleepy');
            }, 5 * 60 * 1000); // 5 minutes inactive
        };

        document.addEventListener('mousemove', resetInactiveTimer);
        document.addEventListener('keypress', resetInactiveTimer);
        document.addEventListener('scroll', resetInactiveTimer);
        
        resetInactiveTimer();
    }

    updateEnergyAndMood() {
        const now = Date.now();
        const sessionDuration = (now - this.sessionStartTime) / (1000 * 60); // minutes
        const timeSinceActivity = (now - this.lastActivityTime) / (1000 * 60); // minutes

        // Energy decreases over time
        let energyDecay = sessionDuration * 0.3; // 0.3% per minute
        
        // Faster decay on distractive sites
        if (!this.isProductiveSite()) {
            energyDecay += sessionDuration * 0.2; // Additional 0.2% per minute
        }
        
        // Faster decay if inactive
        if (timeSinceActivity > 3) {
            energyDecay += (timeSinceActivity - 3) * 1.5; // 1.5% per minute of inactivity
        }

        this.energy = Math.max(0, 100 - energyDecay);

        // Determine mood based on site type and energy
        if (this.energy < 15) {
            this.mood = 'exhausted';
        } else if (this.energy < 35) {
            this.mood = 'tired';
        } else if (this.isProductiveSite()) {
            this.mood = 'focused';
        } else if (this.isEntertainmentSite()) {
            this.mood = 'excited';
        } else {
            this.mood = 'neutral';
        }

        // Adjust pet appearance based on energy
        this.adjustPetForEnergy();
        
        // Store energy and mood for popup
        chrome.storage.local.set({
            currentEnergy: this.energy,
            currentMood: this.mood,
            lastUpdate: now
        });
    }

    adjustPetForEnergy() {
        if (!this.pet) return;

        // Adjust animation speed based on energy
        const energyMultiplier = this.energy / 100;
        const baseSpeed = 2; // seconds
        const adjustedSpeed = baseSpeed / Math.max(0.2, energyMultiplier);
        
        this.pet.style.animationDuration = `${adjustedSpeed}s`;

        // Adjust opacity based on energy
        const minOpacity = 0.6;
        const opacity = minOpacity + (1 - minOpacity) * (this.energy / 100);
        this.pet.style.opacity = opacity;

        // Add energy-based visual effects
        if (this.energy < 20) {
            this.pet.style.filter = 'brightness(0.7) saturate(0.6)';
        } else if (this.energy > 80) {
            this.pet.style.filter = 'brightness(1.2) saturate(1.3)';
        } else {
            this.pet.style.filter = 'brightness(1) saturate(1)';
        }
    }

    isEntertainmentSite() {
        const entertainmentSites = [
            'youtube', 'netflix', 'twitch', 'spotify', 'soundcloud',
            'instagram', 'tiktok', 'snapchat', 'pinterest'
        ];
        
        return entertainmentSites.some(site => this.currentSite.includes(site));
    }

    isProductiveSite() {
        const productiveSites = [
            'docs.google', 'notion', 'github', 'stackoverflow', 
            'coursera', 'udemy', 'khan', 'duolingo'
        ];
        
        return productiveSites.some(site => this.currentSite.includes(site));
    }

    trackBehavior(state) {
        // Send data to background script for analytics
        chrome.runtime.sendMessage({
            type: 'track_behavior',
            data: {
                site: this.currentSite,
                state: state,
                timestamp: Date.now(),
                timeSpent: Date.now() - this.startTime
            }
        });
    }

    bindEvents() {
        if (!this.pet) return;

        // Pet click interactions
        this.pet.addEventListener('click', () => {
            // Cycle through states for demo
            const states = ['idle', 'happy', 'excited'];
            const currentState = states.find(s => this.pet.classList.contains(s)) || 'idle';
            const currentIndex = states.indexOf(currentState);
            const nextState = states[(currentIndex + 1) % states.length];
            this.setPetState(nextState);
        });

        // Pet hover effects
        this.pet.addEventListener('mouseenter', () => {
            this.pet.style.transform = 'scale(1.1)';
        });

        this.pet.addEventListener('mouseleave', () => {
            this.pet.style.transform = 'scale(1)';
        });
    }
}

// Initialize pet when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new FocusPet());
} else {
    new FocusPet();
}
