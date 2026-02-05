'use client'

import { loadStripe } from '@stripe/stripe-js'
import {
    PaymentElement,
    Elements,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js'
import { useState } from 'react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock')

function CheckoutForm({ amount, onSuccess, onCancel }: { amount: number; onSuccess: () => void; onCancel: () => void }) {
    const stripe = useStripe()
    const elements = useElements()
    const [message, setMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) return

        setIsLoading(true)

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/advisory?payment_success=true`,
            },
            redirect: 'if_required',
        })

        if (error) {
            setMessage(error.message ?? 'An unexpected error occurred.')
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess()
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement className="bg-white p-4 rounded-lg" />
            <div className="flex gap-3">
                <button
                    disabled={isLoading || !stripe || !elements}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all"
                >
                    {isLoading ? 'Processing...' : `Pay $${amount}`}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
                >
                    Cancel
                </button>
            </div>
            {message && <div className="text-red-400 text-sm mt-2 font-medium">{message}</div>}
        </form>
    )
}

export default function StripePaymentModal({
    amount,
    clientSecret,
    onSuccess,
    onCancel
}: {
    amount: number
    clientSecret: string
    onSuccess: () => void
    onCancel: () => void
}) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Secure Payment</h2>
                <p className="text-gray-400 mb-8">Confirm your booking for <span className="text-white font-semibold">${amount}</span></p>

                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                    <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
                </Elements>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secured by Stripe SSL Encryption</span>
                </div>
            </div>
        </div>
    )
}
