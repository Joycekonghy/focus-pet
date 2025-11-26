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
        
        // Listen for Chrome storage changes (from website)
        try {
            if (chrome.storage && chrome.storage.onChanged) {
                chrome.storage.onChanged.addListener((changes, namespace) => {
                    if (namespace === 'local' && (changes.currentPet || changes.siteReactions || changes.customAvatar)) {
                        console.log('Chrome storage changed, reloading pet');
                        setTimeout(() => this.reloadPet(), 100);
                    }
                });
            }
        } catch (error) {
            console.log('Cannot listen to storage changes - extension context invalidated');
        }
    }

    async loadConfig() {
        try {
            if (!chrome.storage) {
                throw new Error('Extension context invalidated');
            }
            
            const result = await chrome.storage.local.get([
                'currentPet', 
                'siteReactions', 
                'customAvatar',
                'aiAnimations',
                'focusPetPurchases'
            ]);
            
            // If Chrome storage is empty, try localStorage
            if (!result.currentPet && !result.siteReactions) {
                try {
                    const localPet = localStorage.getItem('currentPet');
                    const localReactions = localStorage.getItem('siteReactions');
                    const localAvatar = localStorage.getItem('customAvatar');
                    
                    if (localPet || localReactions) {
                        this.config.pet = localPet || 'cat';
                        this.config.reactions = localReactions ? JSON.parse(localReactions) : [];
                        this.config.customAvatar = localAvatar;
                        
                        // Save to Chrome storage for future use
                        chrome.storage.local.set({
                            currentPet: this.config.pet,
                            siteReactions: this.config.reactions,
                            customAvatar: this.config.customAvatar
                        });
                        
                        console.log('Synced from localStorage to Chrome storage');
                    }
                } catch (e) {
                    console.log('localStorage not available');
                }
            } else {
                this.config.pet = result.currentPet || 'cat';
                this.config.reactions = result.siteReactions || [];
                this.config.customAvatar = result.customAvatar;
            }
            
            this.config.aiAnimations = result.aiAnimations || [];
            this.purchases = result.focusPetPurchases || {};
            
            console.log('Extension config loaded:', {
                pet: this.config.pet,
                hasCustomAvatar: !!this.config.customAvatar,
                reactions: this.config.reactions.length,
                reactionsData: this.config.reactions
            });
            
            if (this.isPremiumPet(this.config.pet) && !this.hasPurchased(this.config.pet)) {
                this.config.pet = 'cat';
            }
            
        } catch (error) {
            console.log('Using defaults:', error);
        }
    }

    createPet() {
        // Remove existing pet
        const existing = document.getElementById('focus-pet');
        if (existing) existing.remove();

        // Create pet container
        this.pet = document.createElement('div');
        this.pet.id = 'focus-pet';
        
        // Add custom avatar if available
        if (this.config.customAvatar) {
            console.log('Loading custom avatar:', this.config.customAvatar.substring(0, 50) + '...');
            // Create an img element to test if the image loads
            const testImg = new Image();
            testImg.onload = () => {
                console.log('Custom avatar loaded successfully');
                // Use both pet type AND custom - exactly like website
                this.pet.className = `focus-pet ${this.config.pet} custom idle`;
                this.pet.style.backgroundImage = `url("${this.config.customAvatar}")`;
                this.pet.style.backgroundSize = 'cover';
                this.pet.style.backgroundPosition = 'center';
                this.pet.style.backgroundRepeat = 'no-repeat';
            };
            testImg.onerror = () => {
                console.log('Custom avatar failed to load, using default pet');
                this.pet.className = `focus-pet ${this.config.pet} idle`; // Use default pet
            };
            testImg.src = this.config.customAvatar;
        } else {
            console.log('No custom avatar found, using default pet:', this.config.pet);
            this.pet.className = `focus-pet ${this.config.pet} idle`;
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
        
        console.log('Setting pet state to:', state);
        
        // Always maintain base classes and pet type
        const baseClasses = ['focus-pet', this.config.pet];
        if (this.config.customAvatar) {
            baseClasses.push('custom');
        }
        
        // Set complete class list
        this.pet.className = baseClasses.join(' ') + ' ' + state;
        
        // Reset inline styles to let CSS handle animations
        this.pet.style.border = '';
        this.pet.innerHTML = '';
        this.pet.style.animation = '';
        this.pet.style.filter = '';
        this.pet.style.display = '';
        this.pet.style.alignItems = '';
        this.pet.style.justifyContent = '';
        this.pet.style.fontSize = '';
        
        console.log('Pet classes after state change:', this.pet.className);
        
        // Send tracking data
        this.trackBehavior(state);
    }

    startTracking() {
        // Check for site-specific reactions immediately
        this.checkSiteReaction();
        
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
        try {
            if (chrome.storage) {
                chrome.storage.local.set({
                    currentEnergy: this.energy,
                    currentMood: this.mood,
                    lastUpdate: now
                });
            }
        } catch (error) {
            console.log('Cannot store data - extension context invalidated');
        }
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
        try {
            if (chrome.runtime && chrome.runtime.sendMessage) {
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
        } catch (error) {
            console.log('Cannot send message - extension context invalidated');
        }
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

    isPremiumPet(petType) {
        const premiumPets = ['rabbit', 'bird', 'fox', 'panda', 'hamster', 'owl', 'bear', 'penguin', 'frog', 'turtle', 'snake', 'fish', 'butterfly', 'bee', 'dragon', 'unicorn', 'phoenix', 'alien', 'ghost', 'robot', 'wizard', 'crystal', 'flame', 'shadow', 'galaxy'];
        return premiumPets.includes(petType);
    }

    hasPurchased(petType) {
        if (!this.purchases) return false;
        return this.purchases.everything || this.purchases.allPets || this.purchases[petType];
    }

    checkSiteReaction() {
        const hostname = window.location.hostname;
        console.log('Checking site reaction for:', hostname);
        console.log('Available custom reactions:', this.config.reactions);
        
        // Check custom reactions first - these take priority
        if (this.config.reactions && this.config.reactions.length > 0) {
            for (const reaction of this.config.reactions) {
                console.log('Checking reaction:', reaction.site, 'against', hostname);
                if (hostname.includes(reaction.site) || reaction.site.includes(hostname)) {
                    console.log('Found custom reaction:', reaction.reaction, 'for site:', reaction.site);
                    this.setPetState(reaction.reaction);
                    return;
                }
            }
        }
        
        // Only use defaults if no custom reactions are configured at all
        console.log('No custom reactions found, using idle state');
        this.setPetState('idle');
    }

    async reloadPet() {
        // Remove old pet
        if (this.pet && this.pet.parentNode) {
            this.pet.parentNode.removeChild(this.pet);
        }
        
        // Reload config and create new pet
        await this.loadConfig();
        this.createPet();
        document.body.appendChild(this.pet);
        
        // Check reactions for new pet
        this.checkSiteReaction();
    }
}

// Initialize pet when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new FocusPet());
} else {
    new FocusPet();
}
