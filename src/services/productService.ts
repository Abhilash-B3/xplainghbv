import { XplainProduct, ApplianceShowcase } from "@/types/product";
import { apiRequest } from "./apiClient";

export interface BackendProduct {
  id: string;
  ref: string;
  name: string;
  description?: string;
  priceEUR: string | number;
  imageUrl: string;
  stockQuantity: number;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

export interface BackendShowcase {
  id: string;
  name: string;
  desc: string;
  imageUrl: string;
  tag: string;
  displayOrder: number;
}

export interface ProductsResponse {
  products: BackendProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const productService = {
  /**
   * Fetches real products from PostgreSQL via Express backend.
   */
  async getAllProducts(categorySlug?: string, search?: string): Promise<XplainProduct[]> {
    const params = new URLSearchParams();
    if (categorySlug && categorySlug !== "All" && categorySlug !== "all") {
      params.append("category", categorySlug);
    }
    if (search && search.trim()) {
      params.append("search", search.trim());
    }
    params.append("limit", "100");

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await apiRequest<ProductsResponse>(`/products${queryString}`);

    return (res.products || []).map((p) => ({
      id: p.id,
      ref: p.ref,
      name: p.name,
      category: p.category?.name || "General",
      priceEUR: typeof p.priceEUR === "string" ? parseFloat(p.priceEUR) : p.priceEUR,
      img: p.imageUrl,
      stockQuantity: p.stockQuantity,
      description: p.description,
    }));
  },

  /**
   * Fetches product categories from PostgreSQL.
   */
  async getCategories(): Promise<string[]> {
    const categories = await apiRequest<BackendCategory[]>("/categories");
    const names = (categories || []).map((c) => c.name);
    return ["All", ...names];
  },

  /**
   * Fetches showcase appliances for the landing page from PostgreSQL.
   */
  async getShowcaseAppliances(): Promise<ApplianceShowcase[]> {
    const showcase = await apiRequest<BackendShowcase[]>("/showcase");
    return (showcase || []).map((s) => ({
      id: s.id,
      name: s.name,
      desc: s.desc,
      img: s.imageUrl,
      tag: s.tag,
    }));
  },
};
