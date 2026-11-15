import { Currency, ResalePlan } from "@/types";
import { apiRequest } from "./apiClient";

export interface QuoteItemRequest {
  productId: string;
  quantity: number;
}

export interface InvestmentQuoteResponse {
  resalePlan: ResalePlan;
  currency: Currency;
  exchangeRateToEUR: string;
  discountMultiplier: string;
  subtotalEUR: string;
  discountAmountEUR: string;
  totalAmountEUR: string;
  subtotalInCurrency: string;
  discountAmountInCurrency: string;
  totalAmountInCurrency: string;
  monthlyReturnRate: string;
  estimatedMonthlyReturnEUR: string;
  estimatedMonthlyReturnInCurrency: string;
  lockDurationMonths: number;
  expiresAt: string;
}

export interface CreateInvestmentRequest {
  resalePlan: ResalePlan;
  currency: Currency;
  items: QuoteItemRequest[];
  deliveryAddressId?: string;
}

export interface FinancialSummaryData {
  availableReturnsEUR: string;
  lockedCapitalEUR: string;
  unlockedCapitalEUR: string;
  totalInvestedEUR: string;
  totalPaidOutEUR: string;
  availableReturnsInCurrency: string;
  lockedCapitalInCurrency: string;
  unlockedCapitalInCurrency: string;
  portfolioValueInCurrency: string;
  preferredCurrency: Currency;
  activeBatchesCount: number;
  completedBatchesCount: number;
}

export interface InvestmentRecord {
  id: string;
  status: string;
  resalePlan: ResalePlan;
  currency: Currency;
  totalAmountInCurrency: string;
  totalAmountEUR: string;
  createdAt: string;
  items: Array<{
    id: string;
    productRef: string;
    productName: string;
    unitPriceEUR: string;
    quantity: number;
    lineTotalEUR: string;
  }>;
  batch?: {
    id: string;
    batchNumber: number;
    capitalEUR: string;
    startDate: string;
    firstPayoutDate: string;
    status: string;
    payouts: Array<{
      id: string;
      payoutIndex: number;
      dueDate: string;
      amountEUR: string;
      status: string;
      paidAt?: string;
    }>;
  };
}

export const investmentService = {
  /**
   * Request server-authoritative investment quote.
   */
  async getQuote(req: {
    resalePlan: ResalePlan;
    currency: Currency;
    items: QuoteItemRequest[];
  }): Promise<InvestmentQuoteResponse> {
    return apiRequest<InvestmentQuoteResponse>('/investments/quote', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  /**
   * Create an investment intent in PostgreSQL with pending payment.
   */
  async createInvestment(
    req: CreateInvestmentRequest,
    idempotencyKey?: string
  ): Promise<{ investment: InvestmentRecord }> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    return apiRequest<{ investment: InvestmentRecord }>('/investments', {
      method: 'POST',
      headers,
      body: JSON.stringify(req),
    });
  },

  /**
   * Retrieve list of investments for authenticated user.
   */
  async getMyInvestments(): Promise<{ investments: InvestmentRecord[] }> {
    return apiRequest<{ investments: InvestmentRecord[] }>('/investments');
  },

  /**
   * Retrieve authoritative financial summary from PostgreSQL ledger.
   */
  async getMyFinancialSummary(): Promise<FinancialSummaryData> {
    return apiRequest<FinancialSummaryData>('/users/me/financial-summary');
  },
};
