import { apiRequest } from './apiClient';
import { Currency } from '@/types';

export interface BankAccountRecord {
  id: string;
  bankName: string;
  accountNumberMasked: string;
  sortCodeOrSwift: string;
  accountHolderName: string;
  currency: Currency;
  country: string;
  isVerified: boolean;
  createdAt: string;
}

export interface MoMoAccountRecord {
  id: string;
  provider: string;
  phoneNumberMasked: string;
  accountHolderName: string;
  country: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AddBankAccountPayload {
  bankName: string;
  accountNumber: string;
  sortCodeOrSwift: string;
  accountHolderName: string;
  currency?: Currency;
  country?: string;
}

export interface AddMoMoAccountPayload {
  provider: 'MTN_MOMO' | 'VODAFONE_CASH' | 'AIRTELTIGO_MONEY';
  phoneNumber: string;
  accountHolderName: string;
  country?: string;
}

export class DestinationService {
  static async listBankAccounts(): Promise<BankAccountRecord[]> {
    const res = await apiRequest<{ accounts: BankAccountRecord[] }>('/bank-accounts', {
      method: 'GET',
    });
    return res.accounts;
  }

  static async addBankAccount(payload: AddBankAccountPayload): Promise<BankAccountRecord> {
    return apiRequest<BankAccountRecord>('/bank-accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async deleteBankAccount(id: string): Promise<void> {
    await apiRequest(`/bank-accounts/${id}`, {
      method: 'DELETE',
    });
  }

  static async listMoMoAccounts(): Promise<MoMoAccountRecord[]> {
    const res = await apiRequest<{ accounts: MoMoAccountRecord[] }>('/momo-accounts', {
      method: 'GET',
    });
    return res.accounts;
  }

  static async addMoMoAccount(payload: AddMoMoAccountPayload): Promise<MoMoAccountRecord> {
    return apiRequest<MoMoAccountRecord>('/momo-accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async deleteMoMoAccount(id: string): Promise<void> {
    await apiRequest(`/momo-accounts/${id}`, {
      method: 'DELETE',
    });
  }
}
