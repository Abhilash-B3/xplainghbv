import { useState } from "react";
import { PartnerProfile, PaymentMethod, ResalePlan } from "@/types";
import { CartItem } from "@/types/product";
import { fmt } from "@/utils/currency";
import { investmentService } from "@/services/investmentService";
import ProductCatalogueStep from "@/components/investments/ProductCatalogueStep";
import PaymentStep from "@/components/payments/PaymentStep";

interface DashboardAddStockProps {
  partner: PartnerProfile;
  batchData: Array<{
    id: string;
    orderedAt: string;
    firstPayout: string;
    capitalInView: number;
    monthly: number;
  }>;
  onAddStockSuccess: (
    amount: number,
    method: PaymentMethod,
    productNames: string
  ) => void;
}

export default function DashboardAddStock({
  partner,
  batchData,
  onAddStockSuccess,
}: DashboardAddStockProps) {
  const [topupStep, setTopupStep] = useState<null | "products" | "payment">(null);
  const [addstockAmount, setTopupAmount] = useState(0);
  const [addstockProducts, setTopupProducts] = useState<string>("");
  const [createdInvestmentId, setCreatedInvestmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTopupSelect = async (
    items: CartItem[],
    option: ResalePlan,
    amount: number
  ) => {
    const names = items
      .map(({ product, qty }) => `${qty}× ${product.name}`)
      .join(" | ");
    setTopupProducts(names);
    setTopupAmount(amount);
    setLoading(true);
    setError(null);

    try {
      const planEnum = option === "direct" ? "DIRECT" : "SELLFOR";
      const quoteItems = items.map((i) => ({
        productId: i.product.id || '',
        quantity: i.qty,
      }));

      // Create authoritative investment in PostgreSQL
      const invRes = await investmentService.createInvestment({
        resalePlan: planEnum as any,
        currency: partner.currency,
        items: quoteItems,
      });

      const invId = invRes.investment?.id || (invRes as any)?.id;
      setCreatedInvestmentId(invId);
      setTopupStep("payment");
    } catch (err: any) {
      setError(err.message || "Failed to create investment topup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTopupPayment = (method: PaymentMethod) => {
    onAddStockSuccess(addstockAmount, method, addstockProducts);
    setTopupAmount(0);
    setTopupProducts("");
    setCreatedInvestmentId(null);
    setTopupStep(null);
  };

  if (topupStep === "products") {
    return (
      <div className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
            {error}
          </div>
        )}
        <ProductCatalogueStep
          currency={partner.currency}
          onSelect={handleTopupSelect}
          onBack={() => setTopupStep(null)}
        />
      </div>
    );
  }

  if (topupStep === "payment") {
    return (
      <PaymentStep
        investmentId={createdInvestmentId || undefined}
        amount={addstockAmount}
        currency={partner.currency}
        partnerName={partner.name}
        defaultMethod="visa"
        label="Add Stock — Complete Payment"
        onSuccess={handleTopupPayment}
        onBack={() => setTopupStep("products")}
      />
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="bg-[#0c1830] border border-[#c9a84c22] rounded-2xl p-6 card-glow">
        <h2
          className="font-display text-2xl text-[#e2c97e] mb-2"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Add Stock to Your Capital
        </h2>
        <p className="text-[#4a6070] text-sm mb-6">
          Select additional products to invest in. Your 7% return on the new
          amount starts{" "}
          <span className="text-[#c9a84c] font-semibold">
            30 days after payment
          </span>{" "}
          — tracked as a separate batch.
        </p>
        <button
          onClick={() => setTopupStep("products")}
          disabled={loading}
          className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <span>🛒</span> Browse Products to Add Stock →
        </button>
      </div>

      {partner.batches && partner.batches.length > 1 && (
        <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-5 card-glow">
          <p className="text-[#8899a6] text-xs font-semibold uppercase tracking-wider mb-4">
            Your Capital Batches
          </p>
          <div className="space-y-3">
            {batchData.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-2 border-b border-[#c9a84c08] last:border-0"
              >
                <div>
                  <p className="text-[#d4c8a8] text-sm font-semibold">
                    Batch {i + 1}
                  </p>
                  <p className="text-[#4a6070] text-xs">
                    Invested{" "}
                    {new Date(t.orderedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · First payout {t.firstPayout}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="font-mono font-bold text-[#e2c97e] text-sm"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {fmt(t.capitalInView, partner.currency)}
                  </p>
                  <p className="text-[#c9a84c] text-xs">
                    {fmt(t.monthly, partner.currency)}/mo
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
