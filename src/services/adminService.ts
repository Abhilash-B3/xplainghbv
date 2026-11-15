import { apiRequest } from './apiClient';

export interface AdminUserItem {
  id: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  partnerProfile?: {
    id: string;
    fullName: string;
    preferredCurrency: string;
    resalePlan: string;
    referralCode: string;
    kycStatus: string;
  } | null;
}

export interface AdminWithdrawalItem {
  id: string;
  amount: string;
  currency: string;
  amountEUR: string;
  destinationType: string;
  status: string;
  rejectionReason?: string | null;
  settlementReference?: string | null;
  createdAt: string;
  processedAt?: string | null;
  partnerProfile: {
    fullName: string;
    user: { email: string };
  };
  bankAccount?: {
    bankName: string;
    accountNumberMasked: string;
  } | null;
  moMoAccount?: {
    provider: string;
    phoneNumberMasked: string;
  } | null;
}

export interface ReconciliationReportData {
  timestamp: string;
  isBalanced: boolean;
  totalDebitsEUR: string;
  totalCreditsEUR: string;
  ledgerImbalanceEUR: string;
  platformEscrowBalanceEUR: string;
  lockedCapitalBalanceEUR: string;
  totalActiveBatchesCapitalEUR: string;
  capitalDiscrepancyEUR: string;
  withdrawalReservedBalanceEUR: string;
  pendingWithdrawalsSumEUR: string;
  withdrawalReservationDiscrepancyEUR: string;
  discrepanciesCount: number;
  discrepancies: string[];
}

export class AdminService {
  static async getUsers(params?: { search?: string; role?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<{ users: AdminUserItem[]; total: number }>(`/admin/users?${query}`, {
      method: 'GET',
    });
  }

  static async updateUserStatus(userId: string, status: string) {
    return apiRequest(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  static async getWithdrawals(params?: { status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<{ withdrawals: AdminWithdrawalItem[]; total: number }>(
      `/admin/withdrawals?${query}`,
      { method: 'GET' }
    );
  }

  static async approveWithdrawal(id: string) {
    return apiRequest(`/admin/withdrawals/${id}/approve`, {
      method: 'POST',
    });
  }

  static async processWithdrawal(id: string) {
    return apiRequest(`/admin/withdrawals/${id}/process`, {
      method: 'POST',
    });
  }

  static async completeWithdrawal(id: string, settlementReference: string, settlementProof?: any) {
    return apiRequest(`/admin/withdrawals/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ settlementReference, settlementProof }),
    });
  }

  static async rejectWithdrawal(id: string, reason: string) {
    return apiRequest(`/admin/withdrawals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  static async getLedgerTransactions() {
    return apiRequest<{ transactions: any[]; total: number }>('/admin/ledger/transactions', {
      method: 'GET',
    });
  }

  static async getReconciliationReport(): Promise<ReconciliationReportData> {
    return apiRequest<ReconciliationReportData>('/admin/reconciliation/report', {
      method: 'GET',
    });
  }

  static async getAuditLogs() {
    return apiRequest<{ logs: any[]; total: number }>('/admin/audit-logs', {
      method: 'GET',
    });
  }
}
