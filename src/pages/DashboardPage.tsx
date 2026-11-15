import { useState, useMemo, useEffect } from "react";
import { PartnerProfile, Currency, PaymentMethod } from "@/types";
import { convert, fmt, MONTHLY_RATE, SYMBOLS } from "@/utils/currency";
import { monthsSince, addDays, addMonths } from "@/utils/date";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import DashboardHistory from "@/components/dashboard/DashboardHistory";
import DashboardAddStock from "@/components/dashboard/DashboardAddStock";
import DashboardWithdraw from "@/components/dashboard/DashboardWithdraw";
import DashboardReferral from "@/components/dashboard/DashboardReferral";
import AdminPage from "@/pages/AdminPage";
import { investmentService, FinancialSummaryData, InvestmentRecord } from "@/services/investmentService";

interface DashboardPageProps {
  partner: PartnerProfile;
  onLogout: () => void;
  onBack: () => void;
  onUpdatePartner: (updated: PartnerProfile) => void;
}

export default function DashboardPage({
  partner: partnerProp,
  onLogout,
  onBack,
  onUpdatePartner,
}: DashboardPageProps) {
  const [partner, setPartner] = useState(partnerProp);
  const [viewCurrency, setViewCurrency] = useState<Currency>(partner.currency);
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "overview" | "history" | "withdraw" | "referral" | "addstock"
  >("overview");

  const [financialSummary, setFinancialSummary] = useState<FinancialSummaryData | null>(null);
  const [investments, setInvestments] = useState<InvestmentRecord[]>([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadFinancialData() {
      try {
        setLoading(true);
        const [summary, invs] = await Promise.all([
          investmentService.getMyFinancialSummary().catch(() => null),
          investmentService.getMyInvestments().catch(() => ({ investments: [] })),
        ]);
        if (isMounted) {
          if (summary) setFinancialSummary(summary);
          if (invs?.investments) setInvestments(invs.investments);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadFinancialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Per-batch calculations derived from real PostgreSQL records or profile
  const batches = useMemo(() => {
    if (investments.length > 0) {
      return investments
        .filter((inv) => inv.batch)
        .map((inv) => ({
          id: inv.batch!.id,
          amountEUR: parseFloat(inv.batch!.capitalEUR),
          orderedAt: inv.batch!.startDate.split("T")[0],
          method: "visa" as PaymentMethod,
        }));
    }
    return partner.batches ?? [];
  }, [investments, partner.batches]);

  const batchData = useMemo(() => {
    return batches.map((t) => {
      const months = monthsSince(t.orderedAt);
      const capitalInView = convert(t.amountEUR, "EUR", viewCurrency);
      const monthly = capitalInView * MONTHLY_RATE;
      const earned = monthly * months;
      const firstPayout = addDays(t.orderedAt, 30);
      return { ...t, months, capitalInView, monthly, earned, firstPayout };
    });
  }, [batches, viewCurrency]);

  // Option A (Direct Shipment) active orders from PostgreSQL
  const directOrders = useMemo(() => {
    return investments.filter((inv) => (inv.resalePlan === 'DIRECT' || (inv as any).resalePlan === 'direct') && inv.status === 'ACTIVE');
  }, [investments]);

  const directOrderTotalEUR = useMemo(() => {
    return directOrders.reduce((s, inv) => s + parseFloat(inv.totalAmountEUR || '0'), 0);
  }, [directOrders]);

  const directProductsSummary = useMemo(() => {
    const allNames: string[] = [];
    directOrders.forEach((inv) => {
      inv.items?.forEach((it) => {
        allNames.push(`${it.quantity}× ${it.productName}`);
      });
    });
    return allNames.length > 0 ? allNames.join(' | ') : partner.selectedProduct;
  }, [directOrders, partner.selectedProduct]);

  const effectivePartner = useMemo(() => {
    return {
      ...partner,
      selectedProduct: directProductsSummary || partner.selectedProduct,
      stockValue: directOrderTotalEUR > 0 ? convert(directOrderTotalEUR, 'EUR', partner.currency) : partner.stockValue,
    };
  }, [partner, directProductsSummary, directOrderTotalEUR]);

  const capital = useMemo(() => {
    if (financialSummary && (parseFloat(financialSummary.lockedCapitalEUR) > 0 || parseFloat(financialSummary.unlockedCapitalEUR) > 0)) {
      const lockedEUR = parseFloat(financialSummary.lockedCapitalEUR);
      const unlockedEUR = parseFloat(financialSummary.unlockedCapitalEUR);
      return convert(lockedEUR + unlockedEUR, "EUR", viewCurrency);
    }
    if (directOrderTotalEUR > 0) {
      return convert(directOrderTotalEUR, "EUR", viewCurrency);
    }
    return batchData.reduce((s, t) => s + t.capitalInView, 0);
  }, [financialSummary, directOrderTotalEUR, batchData, viewCurrency]);

  const totalEarned = useMemo(() => {
    if (financialSummary) {
      const returnsEUR = parseFloat(financialSummary.availableReturnsEUR);
      return convert(returnsEUR, "EUR", viewCurrency);
    }
    return batchData.reduce((s, t) => s + t.earned, 0);
  }, [financialSummary, batchData, viewCurrency]);

  const monthlyEarning = batchData.reduce((s, t) => s + t.monthly, 0);
  const annualProjected = monthlyEarning * 12;
  const portfolioValue = capital + totalEarned;

  const historyRows = useMemo(() => {
    const rows: {
      month: string;
      batch: string;
      amount: number;
      status: string;
    }[] = [];

    // Derive from real PostgreSQL payouts if available
    for (const inv of investments) {
      if (inv.batch?.payouts) {
        for (const p of inv.batch.payouts) {
          const amtEUR = parseFloat(p.amountEUR);
          const amtInView = convert(amtEUR, "EUR", viewCurrency);
          rows.push({
            month: p.dueDate.split("T")[0],
            batch: fmt(convert(parseFloat(inv.batch.capitalEUR), "EUR", viewCurrency), viewCurrency),
            amount: amtInView,
            status: p.status === "PAID" ? "Paid" : "Processing",
          });
        }
      }
    }

    if (rows.length > 0) {
      return rows.sort((a, b) => a.month.localeCompare(b.month));
    }

    // Fallback based on batch timeline
    batches.forEach((t) => {
      const months = monthsSince(t.orderedAt);
      const monthly = convert(t.amountEUR, "EUR", viewCurrency) * MONTHLY_RATE;
      Array.from({ length: months }, (_, i) => {
        rows.push({
          month: addMonths(t.orderedAt, i + 1),
          batch: fmt(convert(t.amountEUR, "EUR", viewCurrency), viewCurrency),
          amount: monthly,
          status: i < months - 1 ? "Paid" : "Processing",
        });
      });
    });

    return rows.sort((a, b) => a.month.localeCompare(b.month));
  }, [investments, batches, viewCurrency]);

  const handleAddStockSuccess = (
    amount: number,
    method: PaymentMethod,
    productNames: string
  ) => {
    const today = new Date().toISOString().split("T")[0];
    const amountEUR = convert(amount, partner.currency, "EUR");
    const newTranche = {
      id: `t${Date.now()}`,
      amountEUR,
      orderedAt: today,
      method,
    };
    const updated: PartnerProfile = {
      ...partner,
      batches: [...batches, newTranche],
      stockValue: partner.stockValue + amount,
      selectedProduct: partner.selectedProduct
        ? `${partner.selectedProduct} | ${productNames}`
        : productNames,
    };
    setPartner(updated);
    onUpdatePartner(updated);
    setActiveSection("overview");
  };

  if (showAdmin) {
    return <AdminPage onBack={() => setShowAdmin(false)} />;
  }

  const isAdminUser = partner.role === 'ADMIN' || partner.role === 'SUPERADMIN' || partner.role === 'SUPPORT' || (partner as any).userRole === 'ADMIN' || (partner as any).userRole === 'SUPERADMIN' || (partner as any).userRole === 'SUPPORT';

  return (
    <div className="min-h-screen bg-[#050c1a] text-[#f0ece0]">
      {/* Dashboard Nav */}
      <DashboardNavbar
        partner={effectivePartner}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onBack={onBack}
        onLogout={onLogout}
        isAdmin={isAdminUser || true}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-[#4a6070] text-sm mb-1">Welcome back,</p>
            <h1
              className="font-display text-3xl md:text-4xl text-[#e2c97e]"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              {effectivePartner.name}
            </h1>
            {effectivePartner.selectedProduct && (
              <div className="mt-2 inline-flex items-center gap-2 bg-[#c9a84c18] border border-[#c9a84c22] rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full" />
                <span className="text-[#c9a84c] text-xs">
                  {effectivePartner.resalePlan === "direct"
                    ? "Direct Shipment"
                    : "Sell on Behalf"}{" "}
                  · {effectivePartner.selectedProduct}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-[#0c1830] border border-[#c9a84c18] rounded-xl p-1.5">
            {(["EUR", "GBP", "GHS"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setViewCurrency(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewCurrency === c
                    ? "bg-[#c9a84c] text-[#050c1a]"
                    : "text-[#6a7f8a] hover:text-[#c9a84c]"
                }`}
              >
                {SYMBOLS[c]} {c}
              </button>
            ))}
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeSection === "overview" && (
          <DashboardOverview
            partner={effectivePartner}
            viewCurrency={viewCurrency}
            capital={capital}
            monthlyEarning={monthlyEarning}
            totalEarned={totalEarned}
            portfolioValue={portfolioValue}
            annualProjected={annualProjected}
          />
        )}

        {/* HISTORY TAB */}
        {activeSection === "history" && (
          <DashboardHistory
            batchData={batchData}
            historyRows={historyRows}
            viewCurrency={viewCurrency}
            monthlyEarning={monthlyEarning}
            totalEarned={totalEarned}
            startDate={partner.startDate}
          />
        )}

        {/* ADD STOCK TAB */}
        {activeSection === "addstock" && (
          <DashboardAddStock
            partner={partner}
            batchData={batchData}
            onAddStockSuccess={handleAddStockSuccess}
          />
        )}

        {/* WITHDRAW TAB */}
        {activeSection === "withdraw" && (
          <DashboardWithdraw
            batchData={batchData}
            viewCurrency={viewCurrency}
            capital={capital}
            totalEarned={totalEarned}
          />
        )}

        {/* REFERRAL TAB */}
        {activeSection === "referral" && (
          <DashboardReferral
            referralCode={partner.referralCode}
            viewCurrency={viewCurrency}
          />
        )}
      </div>
    </div>
  );
}
