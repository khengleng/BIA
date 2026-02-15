import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
    console.warn('⚠️  STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled or fallback to mock mode.');
}

// Initialize with dummy key if missing to prevent crash during module load
export const stripe = new Stripe(stripeSecret || 'sk_test_missing_key', {
    apiVersion: '2023-10-16' as any,
});

const isConfigured = !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_missing_key';

/**
 * KYC & Identity Utilities
 */

export const kyc = {
    /**
     * Create a Stripe VerificationSession
     * This creates a link for the user to upload their ID and take a selfie
     */
    async createVerificationSession(userId: string) {
        if (!isConfigured) {
            console.log('⚠️  Mock Verification Session created for user:', userId);
            return {
                id: 'vs_mock_' + Date.now(),
                url: 'https://checkout.stripe.com/mock_kyc_session',
                status: 'requires_input',
                client_secret: 'vs_mock_secret_' + Date.now()
            } as any;
        }
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
        if (!isConfigured && sessionId.startsWith('vs_mock_')) {
            return { id: sessionId, status: 'verified' };
        }
        return await stripe.identity.verificationSessions.retrieve(sessionId);
    }
};

/**
 * Escrow & Payment Utilities
 */

export const payments = {
    /**
     * Create a Sample/Escrow PaymentIntent
     */
    async createEscrowIntent(amount: number, currency: string = 'usd', metadata: any) {
        if (!isConfigured) {
            console.log('⚠️  Mock Escrow Intent created:', { amount, currency, metadata });
            return {
                id: 'pi_mock_' + Date.now(),
                client_secret: 'pi_mock_secret_' + Date.now(),
                status: 'requires_payment_method'
            } as any;
        }
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe uses cents
                currency,
                payment_method_types: ['card'],
                capture_method: 'manual', // MANUAL capture = Escrow
                metadata,
            });
            return paymentIntent;
        } catch (error) {
            console.error('Stripe Payment Error:', error);
            throw error;
        }
    },

    /**
     * Capture the held funds
     */
    async capturePayment(paymentIntentId: string) {
        if (!isConfigured && paymentIntentId.startsWith('pi_mock_')) {
            return { id: paymentIntentId, status: 'succeeded' } as any;
        }
        return await stripe.paymentIntents.capture(paymentIntentId);
    },

    /**
     * Refund/Release the held funds
     */
    async cancelPayment(paymentIntentId: string) {
        if (!isConfigured && paymentIntentId.startsWith('pi_mock_')) {
            return { id: paymentIntentId, status: 'canceled' } as any;
        }
        return await stripe.paymentIntents.cancel(paymentIntentId);
    }
};

/**
 * Standard Payment Intent (for services/fees)
 */
export async function createPaymentIntent(amount: number, currency: string = 'usd') {
    if (!isConfigured) {
        return {
            id: 'pi_mock_' + Date.now(),
            client_secret: 'pi_mock_secret_' + Date.now(),
            status: 'requires_payment_method'
        } as any;
    }
    return await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method_types: ['card'],
    });
}

