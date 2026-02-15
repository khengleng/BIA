import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
    throw new Error('STRIPE_SECRET_KEY is required and must be set via environment variables.');
}

export const stripe = new Stripe(stripeSecret, {
    apiVersion: '2023-10-16' as any,
});

/**
 * KYC & Identity Utilities
 */

export const kyc = {
    /**
     * Create a Stripe VerificationSession
     * This creates a link for the user to upload their ID and take a selfie
     */
    async createVerificationSession(userId: string) {
        try {
            const session = await stripe.identity.verificationSessions.create({
                type: 'document',
                metadata: { userId },
                options: {
                    document: {
                        require_id_number: true,
                        require_matching_selfie: true,
                    },
                },
            });
            return session;
        } catch (error) {
            console.error('Stripe Identity Error:', error);
            throw error;
        }
    },

    async getVerificationSession(sessionId: string) {
        return await stripe.identity.verificationSessions.retrieve(sessionId);
    }
};

/**
 * Escrow & Payment Utilities
 */

export const payments = {
    /**
     * Create a PaymentIntent for an investment
     * This "authorizes" the payment, effectively holding it in escrow
     */
    async createEscrowIntent(amount: number, currency: string = 'usd', metadata: any) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe uses cents
                currency,
                payment_method_types: ['card'],
                capture_method: 'manual', // MANUAL capture = Escrow (auth first, charge later)
                metadata,
            });
            return paymentIntent;
        } catch (error) {
            console.error('Stripe Payment Error:', error);
            throw error;
        }
    },

    /**
     * Capture the held funds (Release Escrow to SME)
     */
    async capturePayment(paymentIntentId: string) {
        return await stripe.paymentIntents.capture(paymentIntentId);
    },

    /**
     * Refund/Release the held funds back to Investor
     */
    async cancelPayment(paymentIntentId: string) {
        return await stripe.paymentIntents.cancel(paymentIntentId);
    }
};

/**
 * Standard Payment Intent (for services/fees)
 */
export async function createPaymentIntent(amount: number, currency: string = 'usd') {
    return await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method_types: ['card'],
    });
}
