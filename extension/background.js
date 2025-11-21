class PetTracker {
    constructor() {
        this.sessionData = {
            sites: {},
            totalTime: 0,
            startTime: Date.now(),
            mood: 'neutral'
        };
        
        this.init();
    }

    init() {
        // Listen for messages from content script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'track_behavior') {
                this.trackBehavior(message.data);
            }
        });

        // Track tab changes
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.handleTabChange(activeInfo.tabId);
        });

        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.handlePageLoad(tab.url);
            }
        });

        // Sync data with website periodically
        setInterval(() => {
            this.syncWithWebsite();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    trackBehavior(data) {
        const { site, state, timestamp, timeSpent } = data;
        
        // Update site data
        if (!this.sessionData.sites[site]) {
            this.sessionData.sites[site] = {
                visits: 0,
                totalTime: 0,
                states: {},
                lastVisit: timestamp
            };
        }

        this.sessionData.sites[site].visits++;
        this.sessionData.sites[site].totalTime += timeSpent;
        this.sessionData.sites[site].states[state] = (this.sessionData.sites[site].states[state] || 0) + 1;
        this.sessionData.sites[site].lastVisit = timestamp;

        // Calculate mood based on behavior
        this.calculateMood();
        
        // Store in Chrome storage
        chrome.storage.local.set({
            sessionData: this.sessionData,
            lastUpdate: timestamp
        });
    }

    calculateMood() {
        const sites = Object.keys(this.sessionData.sites);
        let productiveTime = 0;
        let distractiveTime = 0;
        
        const productiveSites = ['docs.google', 'notion', 'github', 'stackoverflow'];
        const distractiveSites = ['youtube', 'twitter', 'facebook', 'instagram', 'tiktok'];
        
        sites.forEach(site => {
            const siteData = this.sessionData.sites[site];
            
            if (productiveSites.some(ps => site.includes(ps))) {
                productiveTime += siteData.totalTime;
            } else if (distractiveSites.some(ds => site.includes(ds))) {
                distractiveTime += siteData.totalTime;
            }
        });

        // Calculate mood score (0-100)
        const totalTime = productiveTime + distractiveTime;
        if (totalTime === 0) {
            this.sessionData.mood = 'neutral';
            return;
        }

        const productiveRatio = productiveTime / totalTime;
        
        if (productiveRatio > 0.7) {
            this.sessionData.mood = 'very_happy';
        } else if (productiveRatio > 0.5) {
            this.sessionData.mood = 'happy';
        } else if (productiveRatio > 0.3) {
            this.sessionData.mood = 'neutral';
        } else if (productiveRatio > 0.1) {
            this.sessionData.mood = 'sad';
        } else {
            this.sessionData.mood = 'very_sad';
        }
    }

    handleTabChange(tabId) {
        chrome.tabs.get(tabId, (tab) => {
            if (tab.url) {
                const hostname = new URL(tab.url).hostname;
                this.trackBehavior({
                    site: hostname,
                    state: 'tab_switch',
                    timestamp: Date.now(),
                    timeSpent: 0
                });
            }
        });
    }

    handlePageLoad(url) {
        try {
            const hostname = new URL(url).hostname;
            this.trackBehavior({
                site: hostname,
                state: 'page_load',
                timestamp: Date.now(),
                timeSpent: 0
            });
        } catch (error) {
            // Invalid URL, ignore
        }
    }

    async syncWithWebsite() {
        // In a real implementation, this would sync with your website's API
        // For now, we'll just log the data
        console.log('Pet session data:', this.sessionData);
        
        // Generate daily summary
        const summary = this.generateDailySummary();
        
        // Store summary for popup display
        chrome.storage.local.set({
            dailySummary: summary,
            lastSync: Date.now()
        });
    }

    generateDailySummary() {
        const totalSites = Object.keys(this.sessionData.sites).length;
        const sessionTime = Date.now() - this.sessionData.startTime;
        const hours = Math.floor(sessionTime / (1000 * 60 * 60));
        const minutes = Math.floor((sessionTime % (1000 * 60 * 60)) / (1000 * 60));

        return {
            mood: this.sessionData.mood,
            totalSites: totalSites,
            sessionTime: `${hours}h ${minutes}m`,
            topSites: this.getTopSites(),
            recommendations: this.getRecommendations()
        };
    }

    getTopSites() {
        return Object.entries(this.sessionData.sites)
            .sort(([,a], [,b]) => b.totalTime - a.totalTime)
            .slice(0, 3)
            .map(([site, data]) => ({
                site,
                time: Math.floor(data.totalTime / (1000 * 60)) // minutes
            }));
    }

    getRecommendations() {
        const mood = this.sessionData.mood;
        const recommendations = {
            very_sad: ["Take a break", "Try a productive task", "Limit social media"],
            sad: ["Focus on one task", "Take a short walk", "Drink some water"],
            neutral: ["Keep up the balance", "Try a new productive site"],
            happy: ["Great focus!", "Keep the momentum"],
            very_happy: ["Excellent work!", "You're in the zone!"]
        };
        
        return recommendations[mood] || recommendations.neutral;
    }
}

// Initialize tracker
new PetTracker();
