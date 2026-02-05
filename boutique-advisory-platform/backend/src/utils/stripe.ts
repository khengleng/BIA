import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2023-10-16' as any,
});

export async function createPaymentIntent(amount: number, currency: string = 'usd') {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        return paymentIntent;
    } catch (error) {
        console.error('Stripe error:', error);
        throw error;
    }
}

export async function createCheckoutSession(lineItems: any[], successUrl: string, cancelUrl: string) {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
        });
        return session;
    } catch (error) {
        console.error('Stripe error:', error);
        throw error;
    }
}
