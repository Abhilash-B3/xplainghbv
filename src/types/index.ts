export type View =
  | "landing"
  | "login"
  | "register"
  | "dashboard"
  | "edit-products"
  | "privacy"
  | "cookies"
  | "terms"
  | "safeguarding";

export type Currency = "EUR" | "GBP" | "GHS";

export type PaymentMethod = "momo" | "visa";

export type ResalePlan = "direct" | "sellfor" | "DIRECT" | "SELLFOR";

export interface StockBatch {
  id: string;
  amountEUR: number; // canonical amount in EUR
  orderedAt: string; // ISO date "YYYY-MM-DD"
  method: PaymentMethod;
}

export interface PartnerProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  currency: Currency;
  paymentMethod: PaymentMethod;
  startDate: string;
  selectedProduct?: string;
  resalePlan?: ResalePlan;
  deliveryAddress?: string;
  referralCode: string;
  role?: string;
  batches: StockBatch[];
  stockValue: number; // derived convenience — total in partner's currency
}

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDocument {
  title: string;
  sections: LegalSection[];
}
