class PetDashboard {
    constructor() {
        this.currentPet = 'cat';
        this.petState = 'idle';
        this.customAvatar = null;
        this.aiAnimations = [];
        this.siteReactions = [
            { site: 'youtube.com', reaction: 'headphones' },
            { site: 'twitter.com', reaction: 'excited' },
            { site: 'facebook.com', reaction: 'excited' }
        ];
        
        // Energy and Mood System
        this.energy = 100;
        this.mood = 'happy';
        this.sessionStartTime = Date.now();
        this.lastActivityTime = Date.now();
        this.totalProductiveTime = 0;
        this.totalDistractiveTime = 0;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSiteReactions();
        this.updatePetPreview();
        this.startEnergyMoodTracking();
        this.lockPremiumFeatures(); // Lock premium features based on purchases
    }

    startEnergyMoodTracking() {
        // Update energy and mood every 30 seconds
        setInterval(() => {
            this.updateEnergyAndMood();
        }, 30000);

        // Track user activity
        document.addEventListener('mousemove', () => this.updateActivity());
        document.addEventListener('keypress', () => this.updateActivity());
        document.addEventListener('click', () => this.updateActivity());
        
        // Simulate browsing activity for demo
        this.simulateBrowsingActivity();
    }

    updateActivity() {
        this.lastActivityTime = Date.now();
    }

    updateEnergyAndMood() {
        const now = Date.now();
        const sessionDuration = (now - this.sessionStartTime) / (1000 * 60); // minutes
        const timeSinceActivity = (now - this.lastActivityTime) / (1000 * 60); // minutes

        // Energy decreases over time
        let energyDecay = sessionDuration * 0.5; // 0.5% per minute
        
        // Faster decay if inactive
        if (timeSinceActivity > 5) {
            energyDecay += (timeSinceActivity - 5) * 2; // 2% per minute of inactivity
        }

        this.energy = Math.max(0, 100 - energyDecay);

        // Calculate mood based on productive vs distractive time
        const totalTime = this.totalProductiveTime + this.totalDistractiveTime;
        let productiveRatio = totalTime > 0 ? this.totalProductiveTime / totalTime : 0.5;

        // Adjust mood based on energy level
        if (this.energy < 20) {
            this.mood = 'exhausted';
        } else if (this.energy < 40) {
            this.mood = 'tired';
        } else if (productiveRatio > 0.7) {
            this.mood = 'focused';
        } else if (productiveRatio > 0.5) {
            this.mood = 'happy';
        } else if (productiveRatio > 0.3) {
            this.mood = 'neutral';
        } else {
            this.mood = 'distracted';
        }

        this.updateEnergyMoodDisplay();
        this.adjustPetBehavior();
    }

    updateEnergyMoodDisplay() {
        document.getElementById('energy').textContent = `${Math.round(this.energy)}%`;
        
        const moodMap = {
            exhausted: 'Exhausted 😴',
            tired: 'Tired 😪',
            focused: 'Focused 🎯',
            happy: 'Happy 😊',
            neutral: 'Neutral 😐',
            distracted: 'Distracted 😵'
        };
        
        document.getElementById('mood').textContent = moodMap[this.mood] || 'Happy 😊';
    }

    adjustPetBehavior() {
        const pet = document.getElementById('pet');
        
        // Adjust pet state based on energy and mood
        if (this.energy < 20) {
            this.setPetState('sleepy');
        } else if (this.mood === 'focused') {
            this.setPetState('focused');
        } else if (this.mood === 'distracted') {
            this.setPetState('confused');
        } else if (this.energy > 80) {
            this.setPetState('happy');
        }

        // Adjust animation speed based on energy
        const energyMultiplier = this.energy / 100;
        pet.style.animationDuration = `${2 / Math.max(0.3, energyMultiplier)}s`;
    }

    setPetState(state) {
        const pet = document.getElementById('pet');
        pet.className = `pet ${this.currentPet} ${state}`;
        
        if (this.customAvatar) {
            pet.style.backgroundImage = `url(${this.customAvatar})`;
            pet.style.backgroundSize = 'cover';
            pet.style.backgroundPosition = 'center';
            pet.classList.add('custom');
        }
        
        this.petState = state;
    }

    simulateBrowsingActivity() {
        // Simulate different browsing patterns for demo
        const activities = [
            { type: 'productive', duration: 10, sites: ['github.com', 'stackoverflow.com', 'docs.google.com'] },
            { type: 'distractive', duration: 15, sites: ['youtube.com', 'twitter.com', 'instagram.com'] },
            { type: 'productive', duration: 8, sites: ['notion.so', 'coursera.org'] },
            { type: 'distractive', duration: 20, sites: ['reddit.com', 'tiktok.com'] }
        ];

        let activityIndex = 0;
        setInterval(() => {
            const activity = activities[activityIndex % activities.length];
            
            if (activity.type === 'productive') {
                this.totalProductiveTime += activity.duration;
            } else {
                this.totalDistractiveTime += activity.duration;
            }
            
            activityIndex++;
            this.updateEnergyAndMood();
        }, 45000); // Every 45 seconds
    }

    bindEvents() {
        // Pet selection
        document.querySelectorAll('.pet-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const petType = option.dataset.pet;
                
                // Check if pet is premium and user hasn't purchased it
                if (option.classList.contains('premium') && !this.hasPurchased(petType)) {
                    this.showPremiumModal(petType, 'pet');
                    return;
                }
                
                document.querySelectorAll('.pet-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.currentPet = petType;
                this.updatePetPreview();
                this.updateReactionDemos();
                this.syncToExtension();
            });
        });

        // Avatar upload
        document.getElementById('avatar-upload').addEventListener('change', (e) => {
            this.handleAvatarUpload(e.target.files[0]);
        });

        // Add reaction button
        document.getElementById('add-reaction').addEventListener('click', () => {
            this.addReactionRow();
        });

        // Save reactions button
        document.getElementById('save-reactions').addEventListener('click', () => {
            console.log('Save button clicked!');
            this.saveSiteReactions();
            alert('✅ Reactions saved! They will sync to your extension.');
        });

        // Download extension
        document.getElementById('download-extension').addEventListener('click', () => {
            this.downloadExtension();
        });

        // Pet state demo (click to change states)
        document.getElementById('pet').addEventListener('click', () => {
            this.cyclePetState();
        });

        // AI Animation controls
        document.getElementById('generate-animation').addEventListener('click', () => {
            if (!this.hasPurchased('aiStudio')) {
                this.showPremiumModal('aiStudio', 'feature');
                return;
            }
            this.generateAIAnimation();
        });

        document.getElementById('save-animation').addEventListener('click', () => {
            this.saveAIAnimation();
        });

        // Reactions showcase
        document.querySelectorAll('.reaction-card').forEach(card => {
            card.addEventListener('click', () => {
                const reaction = card.dataset.reaction;
                
                // Check if reaction is premium
                if (this.isPremiumReaction(reaction) && !this.hasPurchased(reaction)) {
                    this.showPremiumModal(reaction, 'reaction');
                    return;
                }
                
                this.previewReactionInMain(reaction);
                
                // Update active state
                document.querySelectorAll('.reaction-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
    }

    updatePetPreview() {
        const pet = document.getElementById('pet');
        pet.className = `pet ${this.currentPet} ${this.petState}`;
    }

    cyclePetState() {
        const states = ['idle', 'happy', 'sleepy', 'excited'];
        const currentIndex = states.indexOf(this.petState);
        this.petState = states[(currentIndex + 1) % states.length];
        this.updatePetPreview();
        
        // Update mood display
        const moodMap = {
            idle: 'Neutral',
            happy: 'Happy',
            sleepy: 'Sleepy',
            excited: 'Excited'
        };
        document.getElementById('mood').textContent = moodMap[this.petState];
    }

    handleAvatarUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.customAvatar = e.target.result;
            
            // Create custom pet with uploaded image
            const pet = document.getElementById('pet');
            pet.style.backgroundImage = `url(${e.target.result})`;
            pet.style.backgroundSize = 'cover';
            pet.style.backgroundPosition = 'center';
            pet.className = 'pet custom idle';
            
            // Save to localStorage for extension
            localStorage.setItem('customAvatar', e.target.result);
            this.syncToExtension();
            
            alert('Custom avatar uploaded! Use AI Animation Studio to create custom animations.');
        };
        reader.readAsDataURL(file);
    }

    async generateAIAnimation() {
        if (!this.customAvatar) {
            alert('Please upload an avatar first!');
            return;
        }

        const generateBtn = document.getElementById('generate-animation');
        const status = document.getElementById('ai-status');
        const preview = document.getElementById('animation-preview');
        const animatedPet = document.getElementById('animated-pet');
        const prompt = document.getElementById('animation-prompt').value.trim();

        if (!prompt) {
            alert('Please enter an animation description!');
            return;
        }

        // Show loading state
        generateBtn.disabled = true;
        generateBtn.textContent = '🤖 Generating...';
        status.className = 'ai-status loading';
        status.textContent = `AI is creating "${prompt}" animation...`;

        try {
            // Generate custom animation based on prompt only
            const customAnimation = this.generateCustomAnimation(prompt);
            
            // Apply the animation
            animatedPet.style.backgroundImage = `url(${this.customAvatar})`;
            animatedPet.style.backgroundSize = 'cover';
            animatedPet.style.backgroundPosition = 'center';
            
            // Apply custom animation
            if (customAnimation) {
                animatedPet.className = `pet custom ${customAnimation.className}`;
                this.injectCustomAnimation(customAnimation);
            } else {
                // Fallback to pulse if no keywords detected
                animatedPet.className = `pet custom pulse`;
            }

            // Pre-fill animation name
            const nameInput = document.getElementById('animation-name');
            nameInput.value = prompt || 'Custom Animation';

            // Show preview
            preview.style.display = 'block';
            status.className = 'ai-status success';
            status.textContent = '✨ Animation generated successfully!';

        } catch (error) {
            status.className = 'ai-status error';
            status.textContent = '❌ Failed to generate animation. Try again.';
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = '✨ Generate AI Animation';
        }
    }

    generateCustomAnimation(prompt) {
        if (!prompt) return null;

        const promptLower = prompt.toLowerCase();
        const animationId = `custom-${Date.now()}`;
        
        let animation = {
            className: animationId,
            keyframes: '',
            duration: '1s',
            timing: 'ease-in-out',
            iteration: 'infinite',
            filter: 'brightness(1)'
        };

        // Color keywords - much more dramatic effects
        let colorFilter = 'brightness(1)';
        if (promptLower.includes('red')) {
            colorFilter = 'brightness(1.5) saturate(2) hue-rotate(0deg) drop-shadow(0 0 25px rgba(255, 0, 0, 0.9)) contrast(1.3)';
        } else if (promptLower.includes('blue')) {
            colorFilter = 'brightness(1.4) saturate(2) hue-rotate(240deg) drop-shadow(0 0 25px rgba(0, 100, 255, 0.9)) contrast(1.3)';
        } else if (promptLower.includes('green')) {
            colorFilter = 'brightness(1.4) saturate(2) hue-rotate(120deg) drop-shadow(0 0 25px rgba(0, 255, 0, 0.9)) contrast(1.3)';
        } else if (promptLower.includes('yellow') || promptLower.includes('gold')) {
            colorFilter = 'brightness(1.6) saturate(2.2) hue-rotate(60deg) drop-shadow(0 0 30px rgba(255, 255, 0, 0.9)) contrast(1.4)';
        } else if (promptLower.includes('purple') || promptLower.includes('violet')) {
            colorFilter = 'brightness(1.4) saturate(2) hue-rotate(280deg) drop-shadow(0 0 25px rgba(150, 0, 255, 0.9)) contrast(1.3)';
        } else if (promptLower.includes('pink')) {
            colorFilter = 'brightness(1.5) saturate(2.5) hue-rotate(320deg) drop-shadow(0 0 25px rgba(255, 20, 147, 0.9)) contrast(1.3)';
        } else if (promptLower.includes('orange')) {
            colorFilter = 'brightness(1.5) saturate(2.2) hue-rotate(30deg) drop-shadow(0 0 25px rgba(255, 140, 0, 0.9)) contrast(1.4)';
        }

        // Glow intensity - even more dramatic
        if (promptLower.includes('glow') || promptLower.includes('bright') || promptLower.includes('shine')) {
            colorFilter = colorFilter.replace('drop-shadow(0 0 25px', 'drop-shadow(0 0 40px');
            colorFilter = colorFilter.replace('drop-shadow(0 0 30px', 'drop-shadow(0 0 50px');
            colorFilter += ' brightness(1.8)';
        }

        // Speed keywords
        if (promptLower.includes('fast') || promptLower.includes('quick') || promptLower.includes('rapid')) {
            animation.duration = '0.3s';
        } else if (promptLower.includes('slow') || promptLower.includes('gentle') || promptLower.includes('peaceful')) {
            animation.duration = '3s';
        }

        // Movement keywords - more dramatic differences
        if (promptLower.includes('bounce') || promptLower.includes('jump') || promptLower.includes('hop')) {
            animation.keyframes = `
                0%, 100% { transform: translateY(0px) scale(1); filter: ${colorFilter}; }
                25% { transform: translateY(-8px) scale(1.05); filter: ${colorFilter} brightness(1.1); }
                50% { transform: translateY(-25px) scale(1.2); filter: ${colorFilter} brightness(1.4); }
                75% { transform: translateY(-12px) scale(1.1); filter: ${colorFilter} brightness(1.2); }
            `;
        } else if (promptLower.includes('spin') || promptLower.includes('rotate') || promptLower.includes('turn')) {
            animation.keyframes = `
                0% { transform: rotate(0deg) scale(1); filter: ${colorFilter}; }
                25% { transform: rotate(90deg) scale(1.1); filter: ${colorFilter} brightness(1.2); }
                50% { transform: rotate(180deg) scale(1.2); filter: ${colorFilter} brightness(1.4); }
                75% { transform: rotate(270deg) scale(1.1); filter: ${colorFilter} brightness(1.2); }
                100% { transform: rotate(360deg) scale(1); filter: ${colorFilter}; }
            `;
            animation.timing = 'linear';
        } else if (promptLower.includes('pulse') || promptLower.includes('breathe') || promptLower.includes('glow')) {
            animation.keyframes = `
                0%, 100% { transform: scale(1); filter: ${colorFilter}; }
                25% { transform: scale(1.1); filter: ${colorFilter} brightness(1.3); }
                50% { transform: scale(1.3); filter: ${colorFilter} brightness(1.8); }
                75% { transform: scale(1.15); filter: ${colorFilter} brightness(1.4); }
            `;
            animation.duration = '1.5s';
        } else {
            // Default dramatic glow/pulse if no movement specified
            animation.keyframes = `
                0%, 100% { transform: scale(1); filter: ${colorFilter}; }
                50% { transform: scale(1.2); filter: ${colorFilter} brightness(1.6); }
            `;
        }

        return animation;
    }

    injectCustomAnimation(animation) {
        // Remove existing custom animation
        const existingStyle = document.getElementById('custom-animation-style');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create new style element
        const style = document.createElement('style');
        style.id = 'custom-animation-style';
        style.textContent = `
            .${animation.className} {
                animation: ${animation.className} ${animation.duration} ${animation.timing} ${animation.iteration};
            }
            @keyframes ${animation.className} {
                ${animation.keyframes}
            }
        `;
        document.head.appendChild(style);
    }

    async callHuggingFaceAPI(imageData, animationStyle, prompt) {
        const API_KEY = 'hf_YOUR_API_KEY_HERE'; // Get free key from huggingface.co
        
        // Convert base64 to blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append('inputs', blob);
        formData.append('parameters', JSON.stringify({
            motion_type: animationStyle,
            prompt: prompt || `${animationStyle} animation`,
            duration: 2.0,
            fps: 12
        }));

        const apiResponse = await fetch(
            'https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid',
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                },
                method: 'POST',
                body: formData,
            }
        );

        if (!apiResponse.ok) {
            throw new Error('Hugging Face API failed');
        }

        const result = await apiResponse.blob();
        return URL.createObjectURL(result);
    }

    async simulateAIProcessing() {
        // Simulate API call to AI service (replace with real implementation)
        return new Promise(resolve => {
            setTimeout(resolve, 2000); // 2 second delay
        });
    }

    saveAIAnimation() {
        const customName = document.getElementById('animation-name').value.trim();
        const prompt = document.getElementById('animation-prompt').value.trim();
        
        // Use custom name or generate from prompt
        const animationName = customName || prompt || 'Custom Animation';
        
        // Save to AI animations list
        const newAnimation = {
            id: Date.now(),
            name: animationName,
            style: `custom-${Date.now()}`,
            prompt: prompt,
            avatar: this.customAvatar,
            created: new Date().toLocaleDateString()
        };

        this.aiAnimations.push(newAnimation);
        localStorage.setItem('aiAnimations', JSON.stringify(this.aiAnimations));

        // Add to site reactions as an option
        this.addAIAnimationToReactions(newAnimation);

        alert(`🎉 "${animationName}" saved! You can now assign it to websites.`);
        
        // Clear inputs
        document.getElementById('animation-name').value = '';
        document.getElementById('animation-prompt').value = '';
    }

    addAIAnimationToReactions(animation) {
        // Add the new AI animation as a reaction option
        const selects = document.querySelectorAll('.reaction-select');
        selects.forEach(select => {
            const option = document.createElement('option');
            option.value = animation.style;
            option.textContent = `🤖 ${animation.name}`;
            select.appendChild(option);
        });
    }

    // Real AI API integration (example)
    async callAIAnimationAPI(imageData, animationStyle) {
        // Example API call structure
        const apiEndpoint = 'https://api.your-ai-service.com/animate';
        
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY'
            },
            body: JSON.stringify({
                image: imageData,
                animation_type: animationStyle,
                output_format: 'css_keyframes'
            })
        });

        if (!response.ok) {
            throw new Error('AI animation failed');
        }

        return await response.json();
    }

    loadSiteReactions() {
        const container = document.querySelector('.reaction-list');
        container.innerHTML = '';
        
        this.siteReactions.forEach((reaction, index) => {
            this.createReactionRow(reaction.site, reaction.reaction, index);
        });
    }

    createReactionRow(site = '', reaction = 'headphones', index = null) {
        const container = document.querySelector('.reaction-list');
        const row = document.createElement('div');
        row.className = 'reaction-item';
        
        row.innerHTML = `
            <input type="text" placeholder="youtube.com" class="site-input" value="${site}">
            <select class="reaction-select">
                <option value="headphones" ${reaction === 'headphones' ? 'selected' : ''}>🎧 Headphones</option>
                <option value="excited" ${reaction === 'excited' ? 'selected' : ''}>😄 Excited</option>
                <option value="sleepy" ${reaction === 'sleepy' ? 'selected' : ''}>😴 Sleepy</option>
                <option value="happy" ${reaction === 'happy' ? 'selected' : ''}>😊 Happy</option>
                <option value="focused" ${reaction === 'focused' ? 'selected' : ''}>🎯 Focused</option>
                <option value="stressed" ${reaction === 'stressed' ? 'selected' : ''}>😰 Stressed</option>
                <option value="confused" ${reaction === 'confused' ? 'selected' : ''}>😵 Confused</option>
                <option value="celebrating" ${reaction === 'celebrating' ? 'selected' : ''}>🎉 Celebrating</option>
                <option value="reading" ${reaction === 'reading' ? 'selected' : ''}>📚 Reading</option>
                <option value="gaming" ${reaction === 'gaming' ? 'selected' : ''}>🎮 Gaming</option>
                <option value="shopping" ${reaction === 'shopping' ? 'selected' : ''}>🛒 Shopping</option>
                <option value="working" ${reaction === 'working' ? 'selected' : ''}>💼 Working</option>
                <option value="relaxing" ${reaction === 'relaxing' ? 'selected' : ''}>🧘 Relaxing</option>
                <option value="dancing" ${reaction === 'dancing' ? 'selected' : ''}>💃 Dancing</option>
                <option value="thinking" ${reaction === 'thinking' ? 'selected' : ''}>🤔 Thinking</option>
                <option value="laughing" ${reaction === 'laughing' ? 'selected' : ''}>😂 Laughing</option>
                <option value="crying" ${reaction === 'crying' ? 'selected' : ''}>😢 Crying</option>
                <option value="angry" ${reaction === 'angry' ? 'selected' : ''}>😡 Angry</option>
                <option value="surprised" ${reaction === 'surprised' ? 'selected' : ''}>😲 Surprised</option>
                <option value="bored" ${reaction === 'bored' ? 'selected' : ''}>😑 Bored</option>
                <option value="love" ${reaction === 'love' ? 'selected' : ''}>😍 In Love</option>
                <option value="sick" ${reaction === 'sick' ? 'selected' : ''}>🤢 Sick</option>
                <option value="cool" ${reaction === 'cool' ? 'selected' : ''}>😎 Cool</option>
                <option value="scared" ${reaction === 'scared' ? 'selected' : ''}>😨 Scared</option>
                <option value="dizzy" ${reaction === 'dizzy' ? 'selected' : ''}>😵‍💫 Dizzy</option>
            </select>
            <button class="preview-btn">👁️</button>
            <button class="remove-btn">×</button>
        `;

        // Bind preview button
        row.querySelector('.preview-btn').addEventListener('click', () => {
            const siteValue = row.querySelector('.site-input').value || 'example.com';
            const reactionValue = row.querySelector('.reaction-select').value;
            this.previewReaction(siteValue, reactionValue);
        });

        // Bind remove button
        row.querySelector('.remove-btn').addEventListener('click', () => {
            if (index !== null) {
                this.siteReactions.splice(index, 1);
            }
            row.remove();
            this.saveSiteReactions();
        });

        // Bind input changes
        row.querySelector('.site-input').addEventListener('change', () => {
            console.log('Site input changed, saving reactions');
            this.saveSiteReactions();
        });
        
        row.querySelector('.reaction-select').addEventListener('change', () => {
            console.log('Reaction select changed, saving reactions');
            this.saveSiteReactions();
        });

        container.appendChild(row);
    }

    previewReaction(site, reaction) {
        const preview = document.getElementById('reaction-preview');
        const previewPet = document.getElementById('preview-pet');
        const previewSite = document.getElementById('preview-site');
        const previewReactionText = document.getElementById('preview-reaction');

        // Update preview pet
        previewPet.className = `pet ${this.currentPet} ${reaction}`;
        
        // Apply custom avatar if available
        if (this.customAvatar) {
            previewPet.style.backgroundImage = `url(${this.customAvatar})`;
            previewPet.style.backgroundSize = 'cover';
            previewPet.style.backgroundPosition = 'center';
            previewPet.classList.add('custom');
        } else {
            previewPet.style.backgroundImage = '';
            previewPet.classList.remove('custom');
        }

        // Update preview info
        previewSite.textContent = site;
        const reactionEmojis = {
            headphones: '🎧 Headphones',
            excited: '😄 Excited', 
            sleepy: '😴 Sleepy',
            happy: '😊 Happy',
            focused: '🎯 Focused',
            stressed: '😰 Stressed',
            confused: '😵 Confused',
            celebrating: '🎉 Celebrating',
            reading: '📚 Reading',
            gaming: '🎮 Gaming',
            shopping: '🛒 Shopping',
            working: '💼 Working',
            relaxing: '🧘 Relaxing',
            dancing: '💃 Dancing',
            thinking: '🤔 Thinking',
            laughing: '😂 Laughing',
            crying: '😢 Crying',
            angry: '😡 Angry',
            surprised: '😲 Surprised',
            bored: '😑 Bored',
            love: '😍 In Love',
            sick: '🤢 Sick',
            cool: '😎 Cool',
            scared: '😨 Scared',
            dizzy: '😵‍💫 Dizzy'
        };
        previewReactionText.textContent = reactionEmojis[reaction] || reaction;

        // Show preview
        preview.style.display = 'block';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            preview.style.display = 'none';
        }, 3000);
    }

    previewReactionInMain(reaction) {
        const pet = document.getElementById('pet');
        
        // Update main pet with reaction
        pet.className = `pet ${this.currentPet} ${reaction}`;
        
        // Apply custom avatar if available
        if (this.customAvatar) {
            pet.style.backgroundImage = `url(${this.customAvatar})`;
            pet.style.backgroundSize = 'cover';
            pet.style.backgroundPosition = 'center';
            pet.classList.add('custom');
        } else {
            pet.style.backgroundImage = '';
            pet.classList.remove('custom');
        }

        // Update mood display
        const moodMap = {
            headphones: 'Listening',
            excited: 'Excited',
            sleepy: 'Sleepy',
            happy: 'Happy',
            focused: 'Focused',
            stressed: 'Stressed',
            confused: 'Confused',
            celebrating: 'Celebrating',
            reading: 'Reading',
            gaming: 'Gaming',
            shopping: 'Shopping',
            working: 'Working',
            relaxing: 'Relaxing',
            dancing: 'Dancing',
            thinking: 'Thinking',
            laughing: 'Laughing',
            crying: 'Crying',
            angry: 'Angry',
            surprised: 'Surprised',
            bored: 'Bored',
            love: 'In Love',
            sick: 'Sick',
            cool: 'Cool',
            scared: 'Scared',
            dizzy: 'Dizzy'
        };
        
        document.getElementById('mood').textContent = moodMap[reaction] || 'Happy';
        this.petState = reaction;

        // Update all reaction demo pets to match current pet type
        this.updateReactionDemos();
    }

    hasPurchased(item) {
        const purchases = JSON.parse(localStorage.getItem('focusPetPurchases') || '{}');
        
        // Check if user has everything bundle
        if (purchases.everything) return true;
        
        // Check specific purchases
        if (item === 'aiStudio') return purchases.aiStudio;
        if (purchases.allPets && this.isPremiumPet(item)) return true;
        if (purchases.allReactions && this.isPremiumReaction(item)) return true;
        
        // Check individual purchases
        return purchases[item] || false;
    }

    isPremiumPet(petType) {
        const freePets = ['cat', 'dog'];
        return !freePets.includes(petType);
    }

    isPremiumReaction(reaction) {
        const freeReactions = ['headphones', 'excited', 'sleepy', 'happy'];
        return !freeReactions.includes(reaction);
    }

    showPremiumModal(item, type) {
        let message = '';
        let actionText = '';
        
        if (type === 'pet') {
            message = `🐾 ${item.charAt(0).toUpperCase() + item.slice(1)} is a premium pet!\n\nUnlock individual pets for $0.99 each, or get all 27 premium pets for just $4.99.`;
            actionText = 'View Pet Pricing';
        } else if (type === 'reaction') {
            message = `🎭 ${item.charAt(0).toUpperCase() + item.slice(1)} is a premium reaction!\n\nUnlock individual reactions for $0.99 each, or get all 21 reactions for just $4.99.`;
            actionText = 'View Reaction Pricing';
        } else if (type === 'feature') {
            message = `🤖 AI Animation Studio is a premium feature!\n\nCreate unlimited custom animations with AI for just $2.99.\n\nOr get everything (pets + reactions + AI) for $7.00!`;
            actionText = 'View AI Studio Pricing';
        }
        
        const userChoice = confirm(message + '\n\nWould you like to see pricing options?');
        
        if (userChoice) {
            window.open('pricing.html', '_blank');
        }
    }

    lockPremiumFeatures() {
        // Lock premium pets
        document.querySelectorAll('.pet-option.premium').forEach(option => {
            const petType = option.dataset.pet;
            if (!this.hasPurchased(petType)) {
                option.classList.add('locked');
                option.style.opacity = '0.6';
                
                // Add lock icon
                if (!option.querySelector('.lock-icon')) {
                    const lockIcon = document.createElement('div');
                    lockIcon.className = 'lock-icon';
                    lockIcon.innerHTML = '🔒';
                    lockIcon.style.cssText = 'position: absolute; top: 5px; right: 5px; font-size: 12px;';
                    option.style.position = 'relative';
                    option.appendChild(lockIcon);
                }
            }
        });

        // Lock premium reactions
        document.querySelectorAll('.reaction-card').forEach(card => {
            const reaction = card.dataset.reaction;
            if (this.isPremiumReaction(reaction) && !this.hasPurchased(reaction)) {
                card.classList.add('locked');
                card.style.opacity = '0.6';
                
                // Add lock icon
                if (!card.querySelector('.lock-icon')) {
                    const lockIcon = document.createElement('div');
                    lockIcon.className = 'lock-icon';
                    lockIcon.innerHTML = '🔒';
                    lockIcon.style.cssText = 'position: absolute; top: 5px; right: 5px; font-size: 12px;';
                    card.style.position = 'relative';
                    card.appendChild(lockIcon);
                }
            }
        });

        // Lock AI Animation Studio
        if (!this.hasPurchased('aiStudio')) {
            const aiSection = document.querySelector('.ai-animation');
            if (aiSection) {
                aiSection.style.opacity = '0.6';
                aiSection.style.pointerEvents = 'none';
                
                // Add premium overlay
                if (!aiSection.querySelector('.premium-overlay')) {
                    const overlay = document.createElement('div');
                    overlay.className = 'premium-overlay';
                    overlay.innerHTML = `
                        <div style="text-align: center; padding: 20px; background: rgba(253, 121, 168, 0.2); border-radius: 10px; margin: 10px 0;">
                            <div style="font-size: 24px; margin-bottom: 10px;">🔒</div>
                            <div style="color: #6c5ce7; font-weight: bold;">AI Animation Studio - Premium Feature</div>
                            <div style="color: #74b9ff; font-size: 14px; margin-top: 5px;">Unlock for $2.99</div>
                            <button onclick="window.open('pricing.html', '_blank')" style="margin-top: 10px; padding: 8px 16px; background: linear-gradient(45deg, #a29bfe, #74b9ff); color: white; border: none; border-radius: 15px; cursor: pointer;">View Pricing</button>
                        </div>
                    `;
                    aiSection.appendChild(overlay);
                }
            }
        }

        // Update reaction dropdown to only show available reactions
        this.updateReactionDropdowns();
    }

    updateReactionDropdowns() {
        document.querySelectorAll('.reaction-select').forEach(select => {
            // Clear existing options
            select.innerHTML = '';
            
            // Add free reactions
            const freeReactions = [
                { value: 'headphones', text: '🎧 Headphones' },
                { value: 'excited', text: '😄 Excited' },
                { value: 'sleepy', text: '😴 Sleepy' },
                { value: 'happy', text: '😊 Happy' }
            ];
            
            freeReactions.forEach(reaction => {
                const option = document.createElement('option');
                option.value = reaction.value;
                option.textContent = reaction.text;
                select.appendChild(option);
            });
            
            // Add purchased premium reactions
            const premiumReactions = [
                { value: 'focused', text: '🎯 Focused' },
                { value: 'stressed', text: '😰 Stressed' },
                { value: 'confused', text: '😵 Confused' },
                { value: 'celebrating', text: '🎉 Celebrating' },
                { value: 'reading', text: '📚 Reading' },
                { value: 'gaming', text: '🎮 Gaming' },
                { value: 'shopping', text: '🛒 Shopping' },
                { value: 'working', text: '💼 Working' },
                { value: 'relaxing', text: '🧘 Relaxing' },
                { value: 'dancing', text: '💃 Dancing' },
                { value: 'thinking', text: '🤔 Thinking' },
                { value: 'laughing', text: '😂 Laughing' },
                { value: 'crying', text: '😢 Crying' },
                { value: 'angry', text: '😡 Angry' },
                { value: 'surprised', text: '😲 Surprised' },
                { value: 'bored', text: '😑 Bored' },
                { value: 'love', text: '😍 In Love' },
                { value: 'sick', text: '🤢 Sick' },
                { value: 'cool', text: '😎 Cool' },
                { value: 'scared', text: '😨 Scared' },
                { value: 'dizzy', text: '😵‍💫 Dizzy' }
            ];
            
            premiumReactions.forEach(reaction => {
                if (this.hasPurchased(reaction.value)) {
                    const option = document.createElement('option');
                    option.value = reaction.value;
                    option.textContent = reaction.text;
                    select.appendChild(option);
                }
            });
        });
    }

    updateReactionDemos() {
        document.querySelectorAll('.reaction-demo').forEach(demo => {
            // Remove all pet type classes
            demo.classList.remove('cat', 'dog', 'rabbit', 'bird', 'fox', 'panda', 'hamster', 'owl', 'bear', 'penguin', 'frog', 'turtle', 'snake', 'fish', 'butterfly', 'bee', 'dragon', 'unicorn', 'phoenix', 'alien', 'ghost', 'robot', 'wizard', 'crystal', 'flame', 'shadow', 'galaxy');
            
            // Add current pet type
            demo.classList.add(this.currentPet);
            
            // Apply custom avatar if available
            if (this.customAvatar) {
                demo.style.backgroundImage = `url(${this.customAvatar})`;
                demo.style.backgroundSize = 'cover';
                demo.style.backgroundPosition = 'center';
                demo.classList.add('custom');
            } else {
                demo.style.backgroundImage = '';
                demo.classList.remove('custom');
            }
        });
    }

    addReactionRow() {
        this.createReactionRow();
    }

    saveSiteReactions() {
        const reactions = [];
        document.querySelectorAll('.reaction-item').forEach(item => {
            const site = item.querySelector('.site-input').value;
            const reaction = item.querySelector('.reaction-select').value;
            if (site.trim()) {
                reactions.push({ site: site.trim(), reaction });
            }
        });
        
        this.siteReactions = reactions;
        localStorage.setItem('siteReactions', JSON.stringify(reactions));
        localStorage.setItem('currentPet', this.currentPet);
        
        // Sync to extension
        this.syncToExtension();
        
        console.log('Saved site reactions:', reactions);
    }

    downloadExtension() {
        // Save current configuration
        this.saveSiteReactions();
        
        // Open Chrome Web Store page
        const chromeStoreUrl = 'https://chrome.google.com/webstore/detail/focus-pet/YOUR_EXTENSION_ID_HERE';
        window.open(chromeStoreUrl, '_blank');
        
        // Show instructions
        alert(`🎉 Opening Chrome Web Store!

Your pet configuration is saved and will sync automatically once you install the extension.

Current settings:
• Pet: ${this.currentPet}
• Reactions: ${this.siteReactions.length} configured
• Custom avatar: ${this.customAvatar ? 'Yes' : 'No'}`);
    }

    syncToExtension() {
        // Save to localStorage - extension will read from here
        localStorage.setItem('currentPet', this.currentPet);
        localStorage.setItem('siteReactions', JSON.stringify(this.siteReactions));
        if (this.customAvatar) {
            localStorage.setItem('customAvatar', this.customAvatar);
        }
        
        console.log('✅ Synced to localStorage for extension:', {
            pet: this.currentPet,
            reactions: this.siteReactions.length,
            hasCustomAvatar: !!this.customAvatar
        });
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new PetDashboard();
});
