export interface XplainProduct {
  id?: string;
  ref: string;
  name: string;
  category: string;
  priceEUR: number;
  img: string;
  stockQuantity?: number;
  description?: string;
}

export interface CartItem {
  product: XplainProduct;
  qty: number;
}

export interface ApplianceShowcase {
  id?: string;
  name: string;
  desc: string;
  img: string;
  tag: string;
}
