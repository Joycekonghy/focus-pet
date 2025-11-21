// Initialize Stripe
const stripe = Stripe('pk_live_51SVKDtBowproMB4w9xaTvNjqfDwDKxkeoNZb2mmEq5RVIVXEQSjxH69b9ZiOfEdg7lhh71f0pJMPXItRik05qSDE00Aky6OwFR'); // Replace with your actual key

// Premium pets data
const premiumPets = [
    { id: 'rabbit', name: 'Rabbit', price: 99 },
    { id: 'bird', name: 'Bird', price: 99 },
    { id: 'fox', name: 'Fox', price: 99 },
    { id: 'panda', name: 'Panda', price: 99 },
    { id: 'hamster', name: 'Hamster', price: 99 },
    { id: 'owl', name: 'Owl', price: 99 },
    { id: 'bear', name: 'Bear', price: 99 },
    { id: 'penguin', name: 'Penguin', price: 99 },
    { id: 'frog', name: 'Frog', price: 99 },
    { id: 'turtle', name: 'Turtle', price: 99 },
    { id: 'snake', name: 'Snake', price: 99 },
    { id: 'fish', name: 'Fish', price: 99 },
    { id: 'butterfly', name: 'Butterfly', price: 99 },
    { id: 'bee', name: 'Bee', price: 99 },
    { id: 'dragon', name: 'Dragon 👑', price: 99 },
    { id: 'unicorn', name: 'Unicorn 👑', price: 99 },
    { id: 'phoenix', name: 'Phoenix 👑', price: 99 },
    { id: 'alien', name: 'Alien 👑', price: 99 },
    { id: 'ghost', name: 'Ghost 👑', price: 99 },
    { id: 'robot', name: 'Robot 👑', price: 99 },
    { id: 'wizard', name: 'Wizard 👑', price: 99 },
    { id: 'crystal', name: 'Crystal 👑', price: 99 },
    { id: 'flame', name: 'Flame 👑', price: 99 },
    { id: 'shadow', name: 'Shadow 👑', price: 99 },
    { id: 'galaxy', name: 'Galaxy 👑', price: 99 }
];

// Premium reactions data
const premiumReactions = [
    { id: 'focused', name: '🎯 Focused', price: 99 },
    { id: 'stressed', name: '😰 Stressed', price: 99 },
    { id: 'confused', name: '😵 Confused', price: 99 },
    { id: 'celebrating', name: '🎉 Celebrating', price: 99 },
    { id: 'reading', name: '📚 Reading', price: 99 },
    { id: 'gaming', name: '🎮 Gaming', price: 99 },
    { id: 'shopping', name: '🛒 Shopping', price: 99 },
    { id: 'working', name: '💼 Working', price: 99 },
    { id: 'relaxing', name: '🧘 Relaxing', price: 99 },
    { id: 'dancing', name: '💃 Dancing', price: 99 },
    { id: 'thinking', name: '🤔 Thinking', price: 99 },
    { id: 'laughing', name: '😂 Laughing', price: 99 },
    { id: 'crying', name: '😢 Crying', price: 99 },
    { id: 'angry', name: '😡 Angry', price: 99 },
    { id: 'surprised', name: '😲 Surprised', price: 99 },
    { id: 'bored', name: '😑 Bored', price: 99 },
    { id: 'love', name: '😍 In Love', price: 99 },
    { id: 'sick', name: '🤢 Sick', price: 99 },
    { id: 'cool', name: '😎 Cool', price: 99 },
    { id: 'scared', name: '😨 Scared', price: 99 },
    { id: 'dizzy', name: '😵‍💫 Dizzy', price: 99 }
];

let selectedPets = [];
let selectedReactions = [];

// Stripe payment functions
async function createCheckoutSession(items, successUrl, cancelUrl) {
    try {
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: items,
                success_url: successUrl,
                cancel_url: cancelUrl
            })
        });

        const session = await response.json();
        
        if (session.error) {
            throw new Error(session.error);
        }

        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            throw new Error(result.error.message);
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('Payment failed: ' + error.message);
    }
}

// Buy all pets
async function buyAllPets() {
    const items = [{
        price_data: {
            currency: 'usd',
            product_data: {
                name: 'All Premium Pets',
                description: '27 premium pet types including Dragon, Unicorn, Phoenix and more',
                images: ['https://your-domain.com/pets-preview.jpg']
            },
            unit_amount: 499 // $4.99
        },
        quantity: 1
    }];

    await createCheckoutSession(
        items,
        https://moodpet.store + '/success.html?product=all-pets',
        https://moodpet.store + '/pricing.html'
    );
}

// Buy all reactions
async function buyAllReactions() {
    const items = [{
        price_data: {
            currency: 'usd',
            product_data: {
                name: 'All Advanced Reactions',
                description: '21 advanced pet reactions for every emotion and activity',
                images: ['https://your-domain.com/reactions-preview.jpg']
            },
            unit_amount: 499 // $4.99
        },
        quantity: 1
    }];

    await createCheckoutSession(
        items,
        https://moodpet.store + '/success.html?product=all-reactions',
        https://moodpet.store + '/pricing.html'
    );
}

// Buy AI Studio
async function buyAIStudio() {
    const items = [{
        price_data: {
            currency: 'usd',
            product_data: {
                name: 'AI Animation Studio',
                description: 'Create unlimited custom pet animations with AI',
                images: ['https://your-domain.com/ai-studio-preview.jpg']
            },
            unit_amount: 299 // $2.99
        },
        quantity: 1
    }];

    await createCheckoutSession(
        items,
        https://moodpet.store + '/success.html?product=ai-studio',
        https://moodpet.store + '/pricing.html'
    );
}

// Buy everything bundle
async function buyEverything() {
    const items = [{
        price_data: {
            currency: 'usd',
            product_data: {
                name: 'Everything Bundle',
                description: 'All premium pets, reactions, and AI Animation Studio',
                images: ['https://your-domain.com/bundle-preview.jpg']
            },
            unit_amount: 700 // $7.00
        },
        quantity: 1
    }];

    await createCheckoutSession(
        items,
        https://moodpet.store + '/success.html?product=everything',
        https://moodpet.store + '/pricing.html'
    );
}

// Show individual pet selection
function showIndividualPets() {
    const modal = document.getElementById('pet-modal');
    const grid = document.getElementById('premium-pets-grid');
    
    grid.innerHTML = '';
    premiumPets.forEach(pet => {
        const petElement = document.createElement('div');
        petElement.className = 'selectable-item';
        petElement.innerHTML = `
            <div class="pet ${pet.id} idle" style="width: 30px; height: 30px; margin: 0 auto 10px;"></div>
            <div>${pet.name}</div>
            <div style="font-size: 12px; color: #74b9ff;">$0.99</div>
        `;
        
        petElement.addEventListener('click', () => {
            petElement.classList.toggle('selected');
            if (petElement.classList.contains('selected')) {
                selectedPets.push(pet);
            } else {
                selectedPets = selectedPets.filter(p => p.id !== pet.id);
            }
        });
        
        grid.appendChild(petElement);
    });
    
    modal.style.display = 'flex';
}

// Show individual reaction selection
function showIndividualReactions() {
    const modal = document.getElementById('reaction-modal');
    const grid = document.getElementById('premium-reactions-grid');
    
    grid.innerHTML = '';
    premiumReactions.forEach(reaction => {
        const reactionElement = document.createElement('div');
        reactionElement.className = 'selectable-item';
        reactionElement.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">${reaction.name.split(' ')[0]}</div>
            <div style="font-size: 12px;">${reaction.name.split(' ').slice(1).join(' ')}</div>
            <div style="font-size: 12px; color: #74b9ff;">$0.99</div>
        `;
        
        reactionElement.addEventListener('click', () => {
            reactionElement.classList.toggle('selected');
            if (reactionElement.classList.contains('selected')) {
                selectedReactions.push(reaction);
            } else {
                selectedReactions = selectedReactions.filter(r => r.id !== reaction.id);
            }
        });
        
        grid.appendChild(reactionElement);
    });
    
    modal.style.display = 'flex';
}

// Buy selected pets
async function buySelectedPets() {
    if (selectedPets.length === 0) {
        alert('Please select at least one pet');
        return;
    }

    const items = selectedPets.map(pet => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: `${pet.name} Pet`,
                description: `Premium ${pet.name} pet for Focus Pet extension`
            },
            unit_amount: pet.price
        },
        quantity: 1
    }));

    await createCheckoutSession(
        items,
        https://moodpet.store + '/success.html?product=individual-pets&items=' + selectedPets.map(p => p.id).join(','),
        https://moodpet.store + '/pricing.html'
    );
}

// Buy selected reactions
async function buySelectedReactions() {
    if (selectedReactions.length === 0) {
        alert('Please select at least one reaction');
        return;
    }

    const items = selectedReactions.map(reaction => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: `${reaction.name} Reaction`,
                description: `Premium ${reaction.name} reaction for Focus Pet extension`
            },
            unit_amount: reaction.price
        },
        quantity: 1
    }));

    await createCheckoutSession(
        items,
        https://moodpet.store + '/success.html?product=individual-reactions&items=' + selectedReactions.map(r => r.id).join(','),
        https://moodpet.store + '/pricing.html'
    );
}

// Close modal
function closeModal() {
    document.getElementById('pet-modal').style.display = 'none';
    document.getElementById('reaction-modal').style.display = 'none';
    selectedPets = [];
    selectedReactions = [];
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Load user's current purchases on page load
document.addEventListener('DOMContentLoaded', () => {
    loadUserPurchases();
});

function loadUserPurchases() {
    // Check what user has already purchased
    const purchases = JSON.parse(localStorage.getItem('focusPetPurchases') || '{}');
    
    // Update UI based on purchases
    if (purchases.allPets || purchases.everything) {
        // User has all pets
        updatePlanButton('all-pets', 'Purchased ✓');
    }
    
    if (purchases.allReactions || purchases.everything) {
        // User has all reactions
        updatePlanButton('all-reactions', 'Purchased ✓');
    }
    
    if (purchases.aiStudio || purchases.everything) {
        // User has AI Studio
        updatePlanButton('ai-studio', 'Purchased ✓');
    }
    
    if (purchases.everything) {
        // User has everything
        updatePlanButton('everything', 'Purchased ✓');
    }
}

function updatePlanButton(planId, text) {
    // Update button text and disable it
    const buttons = document.querySelectorAll(`[onclick*="${planId}"]`);
    buttons.forEach(button => {
        button.textContent = text;
        button.disabled = true;
        button.classList.add('current');
    });
}
