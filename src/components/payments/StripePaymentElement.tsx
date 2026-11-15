import React, { useState } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface StripePaymentElementProps {
  clientSecret: string;
  publishableKey: string;
  amountFormatted: string;
  onPaymentSubmitted: () => void;
  onError: (errorMessage: string) => void;
}

function CheckoutForm({
  amountFormatted,
  onPaymentSubmitted,
  onError,
}: {
  amountFormatted: string;
  onPaymentSubmitted: () => void;
  onError: (errorMessage: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);

    try {
      // 1. Validate Payment Element inputs in browser
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onError(submitError.message || 'Please check your card details');
        setSubmitting(false);
        return;
      }

      // 2. Authoritative confirmPayment with 3DS/SCA modal handling
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        // Immediate client or authentication error (declined, 3DS cancelled, etc.)
        const errorMsg =
          result.error.message ||
          'Payment could not be completed with this card. Please try again.';
        onError(errorMsg);
        setSubmitting(false);
      } else {
        // PaymentIntent successfully submitted to Stripe -> Wait for webhook settlement
        onPaymentSubmitted();
      }
    } catch (err: any) {
      onError(err.message || 'An unexpected error occurred during payment processing.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="stripe-card-payment-form">
      <div className="rounded-xl border border-[#c9a84c22] bg-[#0c1830] p-4">
        <PaymentElement
          id="stripe-payment-element"
          options={{
            layout: 'tabs',
          }}
          onReady={() => setCardReady(true)}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || submitting || !cardReady}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#c9a84c] py-4 text-sm font-bold text-[#050c1a] transition-all hover:bg-[#e2c97e] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#050c1a] border-t-transparent" />
            <span>Authorizing Card...</span>
          </>
        ) : (
          <span>Pay {amountFormatted} with Card →</span>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-[#4a6070]">
        <span>🔒</span>
        <span>256-bit encrypted · Direct Stripe Elements processing · Card data never touches our servers</span>
      </div>
    </form>
  );
}

export default function StripePaymentElement({
  clientSecret,
  publishableKey,
  amountFormatted,
  onPaymentSubmitted,
  onError,
}: StripePaymentElementProps) {
  // Initialize Stripe instance with the environment/backend publishable key
  const [stripePromise] = useState(() => loadStripe(publishableKey));

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#c9a84c',
        colorBackground: '#122040',
        colorText: '#f0ece0',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '12px',
        spacingUnit: '4px',
      },
      rules: {
        '.Tab': {
          backgroundColor: '#0c1830',
          border: '1px solid rgba(201, 168, 76, 0.2)',
          color: '#8899a6',
        },
        '.Tab--selected': {
          backgroundColor: '#122040',
          borderColor: '#c9a84c',
          color: '#e2c97e',
        },
        '.Input': {
          backgroundColor: '#122040',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          color: '#f0ece0',
        },
        '.Input:focus': {
          borderColor: '#c9a84c',
          boxShadow: '0 0 0 1px #c9a84c',
        },
        '.Label': {
          color: '#8899a6',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        amountFormatted={amountFormatted}
        onPaymentSubmitted={onPaymentSubmitted}
        onError={onError}
      />
    </Elements>
  );
}
