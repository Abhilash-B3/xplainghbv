import { apiRequest } from './apiClient';
import type { Currency } from '@/types';

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentTransactionId: string;
  publishableKey: string;
  amount: string;
  currency: Currency;
  status: string;
}

export interface PaymentStatusResponse {
  id: string;
  referenceNumber: string;
  status: 'INITIALIZED' | 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED';
  stripePaymentStatus: string | null;
  amount: string;
  currency: Currency;
  canonicalAmountEUR: string;
  paidAt: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  investment?: {
    id: string;
    status: string;
    resalePlan: string;
    totalAmountEUR: string;
  };
  createdAt: string;
}

export class PaymentService {
  /**
   * Request a real Stripe PaymentIntent for an investment from the backend.
   */
  static async createPaymentIntent(
    investmentId: string,
    idempotencyKey?: string
  ): Promise<CreatePaymentIntentResponse> {
    return apiRequest<CreatePaymentIntentResponse>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ investmentId, idempotencyKey }),
    });
  }

  /**
   * Polls or queries the authoritative backend payment and investment status.
   */
  static async getPaymentStatus(paymentTransactionId: string): Promise<PaymentStatusResponse> {
    return apiRequest<PaymentStatusResponse>(`/payments/${paymentTransactionId}`, {
      method: 'GET',
    });
  }
}
