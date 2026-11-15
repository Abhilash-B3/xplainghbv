import { apiRequest } from './apiClient';
import { Currency } from '@/types';

export interface WithdrawableBalanceResponse {
  availableReturnsEUR: string;
  unlockedCapitalEUR: string;
  totalWithdrawableEUR: string;
  reservedWithdrawalsEUR: string;
  preferredCurrency: Currency;
}

export interface WithdrawalRecord {
  id: string;
  withdrawalType: 'RETURNS' | 'CAPITAL';
  amount: string;
  currency: Currency;
  amountEUR: string;
  destinationType: 'BANK' | 'MOMO';
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED' | 'CANCELLED';
  rejectionReason?: string | null;
  settlementReference?: string | null;
  bankAccount?: {
    bankName: string;
    accountNumberMasked: string;
  } | null;
  moMoAccount?: {
    provider: string;
    phoneNumberMasked: string;
  } | null;
  createdAt: string;
  processedAt?: string | null;
}

export interface RequestWithdrawalPayload {
  withdrawalType?: 'RETURNS' | 'CAPITAL';
  amount: number;
  currency: Currency;
  destinationType: 'BANK' | 'MOMO';
  bankAccountId?: string;
  moMoAccountId?: string;
  idempotencyKey?: string;
}

export class WithdrawalService {
  /**
   * Fetches authoritative withdrawable balance from double-entry ledger.
   */
  static async getBalance(): Promise<WithdrawableBalanceResponse> {
    return apiRequest<WithdrawableBalanceResponse>('/withdrawals/balance', {
      method: 'GET',
    });
  }

  /**
   * Submits a withdrawal request.
   */
  static async requestWithdrawal(payload: RequestWithdrawalPayload): Promise<WithdrawalRecord> {
    return apiRequest<WithdrawalRecord>('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Fetches the user's withdrawal history.
   */
  static async getMyWithdrawals(): Promise<WithdrawalRecord[]> {
    const res = await apiRequest<{ withdrawals: WithdrawalRecord[] }>('/withdrawals', {
      method: 'GET',
    });
    return res.withdrawals;
  }

  /**
   * Cancels a pending withdrawal and releases reserved funds.
   */
  static async cancelWithdrawal(withdrawalId: string): Promise<WithdrawalRecord> {
    return apiRequest<WithdrawalRecord>(`/withdrawals/${withdrawalId}/cancel`, {
      method: 'POST',
    });
  }
}
