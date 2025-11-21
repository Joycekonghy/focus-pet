const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use environment variable
const app = express();

app.use(express.json());
app.use(express.static('.'));

// Create checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { items, success_url, cancel_url } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items,
            mode: 'payment',
            success_url: success_url,
            cancel_url: cancel_url,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook to handle successful payments
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = 'whsec_WewXJoktDi4vBSZbW7tgHCu3Io81QwgI'; // Replace with your webhook secret

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Payment successful:', session.id);
            // Here you would update your database to unlock features for the user
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Stripe server running on port ${PORT}`);
});
