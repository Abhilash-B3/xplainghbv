import { useState, useEffect, useRef } from "react";
import { Currency, PaymentMethod } from "@/types";
import { fmt } from "@/utils/currency";
import { PaymentService } from "@/services/paymentService";
import StripePaymentElement from "./StripePaymentElement";

interface PaymentStepProps {
  investmentId?: string;
  amount: number;
  currency: Currency;
  partnerName: string;
  defaultMethod?: PaymentMethod;
  label?: string;
  onSuccess: (method: PaymentMethod) => void;
  onBack: () => void;
}

type PaymentUIState =
  | "INITIALIZING"
  | "READY"
  | "PROCESSING_SETTLEMENT"
  | "CONFIRMED"
  | "FAILED";

export default function PaymentStep({
  investmentId,
  amount,
  currency,
  label,
  onSuccess,
  onBack,
}: PaymentStepProps) {
  const [uiState, setUiState] = useState<PaymentUIState>("INITIALIZING");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [paymentTxId, setPaymentTxId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingCountRef = useRef(0);

  const initPayment = async () => {
    if (!investmentId) {
      setUiState("FAILED");
      setErrorMessage("Missing investment reference for payment.");
      return;
    }

    setUiState("INITIALIZING");
    setErrorMessage(null);

    try {
      const intent = await PaymentService.createPaymentIntent(investmentId);

      setClientSecret(intent.clientSecret);
      setPublishableKey(
        intent.publishableKey ||
          ((import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY as string) ||
          ""
      );
      setPaymentTxId(intent.paymentTransactionId);

      if (intent.status === "succeeded") {
        setUiState("CONFIRMED");
        setTimeout(() => onSuccess("visa"), 1500);
      } else {
        setUiState("READY");
      }
    } catch (err: any) {
      setUiState("FAILED");
      setErrorMessage(
        err.message || "Failed to initialize secure Stripe payment session. Please try again."
      );
    }
  };

  // 1. Initialize Stripe PaymentIntent on mount or when investmentId changes
  useEffect(() => {
    initPayment();

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [investmentId]);

  // 2. Poll authoritative backend payment status upon card submission
  const startStatusPolling = (txId: string) => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }
    pollingCountRef.current = 0;

    pollingTimerRef.current = setInterval(async () => {
      pollingCountRef.current += 1;

      try {
        const statusData = await PaymentService.getPaymentStatus(txId);

        if (statusData.status === "SUCCESSFUL" && statusData.investment?.status === "ACTIVE") {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setUiState("CONFIRMED");
          setTimeout(() => {
            onSuccess("visa");
          }, 1500);
        } else if (statusData.status === "FAILED") {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setUiState("FAILED");
          setErrorMessage(
            statusData.failureMessage ||
              "Your payment could not be processed. Please try another card."
          );
        } else if (pollingCountRef.current > 30) {
          // Timeout after 60 seconds of polling
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setUiState("PROCESSING_SETTLEMENT");
        }
      } catch (err) {
        // Continue polling on transient network glitch
        if (pollingCountRef.current > 30) {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        }
      }
    }, 2000);
  };

  const handlePaymentSubmitted = () => {
    setUiState("PROCESSING_SETTLEMENT");
    if (paymentTxId) {
      startStatusPolling(paymentTxId);
    }
  };

  const handleCardError = (errorMsg: string) => {
    setErrorMessage(errorMsg);
  };

  const handleRetry = () => {
    initPayment();
  };

  return (
    <div className="min-h-screen bg-[#050c1a] text-[#f0ece0] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {uiState !== "PROCESSING_SETTLEMENT" && uiState !== "CONFIRMED" && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#4a6070] hover:text-[#c9a84c] text-sm mb-8 transition-colors"
          >
            ← Back
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#c9a84c] rounded-lg flex items-center justify-center">
            <span className="text-[#050c1a] font-bold text-sm">X</span>
          </div>
          <span
            className="font-display text-lg text-[#e2c97e]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            {label ?? "Complete Investment Payment"}
          </span>
        </div>

        {/* Amount summary */}
        <div className="bg-[#0c1830] border border-[#c9a84c33] rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-[#4a6070] text-xs mb-1">Authoritative Investment Amount</p>
            <p
              className="font-mono font-bold text-[#e2c97e] text-2xl"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {fmt(amount, currency)}
            </p>
            <p className="text-[#4a6070] text-xs mt-1">
              Secure card payment via Stripe · Visa & all major cards supported
            </p>
          </div>
          <div className="w-12 h-12 bg-[#c9a84c22] rounded-xl flex items-center justify-center text-2xl">
            💳
          </div>
        </div>

        {/* State: Initializing Intent */}
        {uiState === "INITIALIZING" && (
          <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-8 text-center space-y-4">
            <div className="inline-block w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#e2c97e] font-semibold text-sm">Preparing secure payment session...</p>
            <p className="text-[#6a7f8a] text-xs">
              Verifying stock allocation and frozen investment terms with the server.
            </p>
          </div>
        )}

        {/* State: Processing Settlement */}
        {uiState === "PROCESSING_SETTLEMENT" && (
          <div className="bg-[#0c1830] border border-[#c9a84c33] rounded-2xl p-8 text-center space-y-4 animate-pulse">
            <div className="inline-block w-10 h-10 border-3 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#e2c97e] font-semibold text-lg">Authorizing & Settling Payment...</p>
            <p className="text-[#8899a6] text-xs max-w-sm mx-auto">
              Your payment has been received by Stripe. Our financial ledger is currently confirming the transaction and activating your investment.
            </p>
            <p className="text-[#4a6070] text-xs italic">
              Please do not close this window or submit another payment.
            </p>
          </div>
        )}

        {/* State: Confirmed & Activated */}
        {uiState === "CONFIRMED" && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-3">
            <div className="text-5xl mb-2">✅</div>
            <p className="text-emerald-400 font-semibold text-xl">Payment Confirmed & Investment Active!</p>
            <p className="text-[#8899a6] text-sm">
              Your capital has been securely locked and your return schedule has been registered.
            </p>
            <p className="text-[#4a6070] text-xs">Redirecting to your dashboard...</p>
          </div>
        )}

        {/* State: Failed */}
        {uiState === "FAILED" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
            <div className="text-4xl">❌</div>
            <p className="text-red-400 font-semibold text-lg">Payment Could Not Be Completed</p>
            <p className="text-[#8899a6] text-sm max-w-md mx-auto">
              {errorMessage || "An error occurred during payment. Your card has not been charged."}
            </p>
            <button
              onClick={handleRetry}
              className="bg-[#c9a84c] text-[#050c1a] font-bold px-6 py-3 rounded-xl hover:bg-[#e2c97e] transition-all text-sm inline-block"
            >
              Try Again with Card →
            </button>
          </div>
        )}

        {/* State: Ready (Stripe Payment Element) */}
        {uiState === "READY" && clientSecret && publishableKey && (
          <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between border-b border-[#c9a84c18] pb-4">
              <span className="text-xs font-semibold text-[#8899a6] uppercase tracking-wider">
                Card Payment (Visa, Mastercard, etc.)
              </span>
              <span className="text-xs text-[#c9a84c] font-mono">Stripe Secure</span>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <StripePaymentElement
              clientSecret={clientSecret}
              publishableKey={publishableKey}
              amountFormatted={fmt(amount, currency)}
              onPaymentSubmitted={handlePaymentSubmitted}
              onError={handleCardError}
            />
          </div>
        )}
      </div>
    </div>
  );
}
