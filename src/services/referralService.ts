import { apiRequest } from './apiClient';
import { Currency } from '@/types';

export interface RefereeItem {
  referralId: string;
  refereeName: string;
  capitalInView: string;
  capitalEUR: string;
  monthlyBonusInView: string;
  status: 'Active' | 'Pending';
  attributionDate: string;
}

export interface CommissionItem {
  id: string;
  periodMonth: string;
  refereeName: string;
  refereeCapitalEUR: string;
  commissionEUR: string;
  amountInView: string;
  status: string;
  paidAt: string | null;
}

export interface ReferralSummaryResponse {
  referralCode: string;
  referralLink: string;
  viewCurrency: Currency;
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  monthlyEstimatedBonusEUR: string;
  monthlyEstimatedBonusInView: string;
  totalCommissionsEarnedEUR: string;
  totalCommissionsEarnedInView: string;
  referees: RefereeItem[];
  commissions: CommissionItem[];
}

export class ReferralService {
  static async getSummary(currency?: Currency): Promise<ReferralSummaryResponse> {
    const url = currency ? `/referrals/summary?currency=${currency}` : '/referrals/summary';
    return apiRequest<ReferralSummaryResponse>(url, {
      method: 'GET',
    });
  }

  static async attribute(referralCode: string): Promise<void> {
    await apiRequest('/referrals/attribute', {
      method: 'POST',
      body: JSON.stringify({ referralCode }),
    });
  }
}
