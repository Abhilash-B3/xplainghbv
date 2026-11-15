import { PartnerProfile, Currency } from "@/types";
import { fmt, convert, MONTHLY_RATE, CURRENCY_NAMES, SYMBOLS } from "@/utils/currency";
import { monthsSince, formatFullDate } from "@/utils/date";
import EarningsChart from "@/components/dashboard/EarningsChart";

interface DashboardOverviewProps {
  partner: PartnerProfile;
  viewCurrency: Currency;
  capital: number;
  monthlyEarning: number;
  totalEarned: number;
  portfolioValue: number;
  annualProjected: number;
}

export default function DashboardOverview({
  partner,
  viewCurrency,
  capital,
  monthlyEarning,
  totalEarned,
  portfolioValue,
  annualProjected,
}: DashboardOverviewProps) {
  const startFormatted = formatFullDate(partner.startDate);
  const monthsActive = monthsSince(partner.startDate);
  const yearProgress = Math.min(Math.round((monthsActive / 12) * 100), 100);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {(partner.resalePlan === "sellfor"
          ? [
              {
                label: "Capital Stocked",
                value: fmt(capital, viewCurrency),
                sub: `In ${CURRENCY_NAMES[viewCurrency]}`,
                icon: "🏦",
              },
              {
                label: "Monthly Earning",
                value: fmt(monthlyEarning, viewCurrency),
                sub: "7% per month",
                icon: "📈",
                highlight: true,
              },
              {
                label: "Total Earned",
                value: fmt(totalEarned, viewCurrency),
                sub: `Over ${monthsActive} month${monthsActive !== 1 ? "s" : ""}`,
                icon: "💰",
              },
              {
                label: "Portfolio Value",
                value: fmt(portfolioValue, viewCurrency),
                sub: "Capital + returns",
                icon: "📊",
              },
            ]
          : [
              {
                label: "Order Value",
                value: fmt(capital, viewCurrency),
                sub: `Direct purchase in ${CURRENCY_NAMES[viewCurrency]}`,
                icon: "💳",
              },
              {
                label: "Products Ordered",
                value: partner.selectedProduct
                  ? `${partner.selectedProduct.split("|").length} Item${partner.selectedProduct.split("|").length !== 1 ? "s" : ""}`
                  : "—",
                sub: partner.selectedProduct
                  ? (partner.selectedProduct.length > 28 ? partner.selectedProduct.slice(0, 26) + "…" : partner.selectedProduct)
                  : "Direct Shipment",
                icon: "📦",
                highlight: true,
              },
              {
                label: "Shipment Status",
                value: "Processing",
                sub: "Est. 6–10 weeks",
                icon: "🚚",
              },
              {
                label: "Delivery Address",
                value: partner.deliveryAddress ? "On File" : "Pending",
                sub: partner.deliveryAddress ?? "Central Warehouse",
                icon: "📍",
              },
            ]
        ).map(({ label, value, sub, icon, highlight }) => (
          <div
            key={label}
            className={`rounded-2xl p-5 card-glow border ${
              highlight
                ? "bg-[#c9a84c] border-[#c9a84c]"
                : "bg-[#0c1830] border-[#c9a84c18]"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <p
                className={`text-xs font-semibold ${
                  highlight ? "text-[#050c1a]" : "text-[#4a6070]"
                }`}
              >
                {label}
              </p>
              <span className="text-lg">{icon}</span>
            </div>
            <p
              className={`font-mono font-bold text-xl md:text-2xl ${
                highlight ? "text-[#050c1a]" : "text-[#e2c97e]"
              }`}
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {value}
            </p>
            <p
              className={`text-xs mt-1 ${
                highlight ? "text-[#3a2a00]" : "text-[#4a6070]"
              }`}
            >
              {sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Partner Profile */}
        <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-6 card-glow">
          <h3
            className="font-display text-lg text-[#e2c97e] mb-5"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Partner Profile
          </h3>
          <div className="space-y-4">
            {[
              { label: "Full Name", value: partner.name, icon: "👤" },
              { label: "Email Address", value: partner.email, icon: "✉️" },
              { label: "Telephone", value: partner.phone, icon: "📞" },
              { label: "Start Date", value: startFormatted, icon: "📅" },
              {
                label: "Deposit Method",
                value:
                  partner.paymentMethod === "momo"
                    ? "Mobile Money (MoMo)"
                    : "Visa / Card",
                icon: partner.paymentMethod === "momo" ? "📱" : "💳",
              },
              {
                label: "Home Currency",
                value: `${CURRENCY_NAMES[partner.currency]} (${
                  SYMBOLS[partner.currency]
                })`,
                icon: "💱",
              },
              ...(partner.selectedProduct
                ? [
                    {
                      label: "Product",
                      value: partner.selectedProduct,
                      icon: "📦",
                    },
                  ]
                : []),
              ...(partner.resalePlan
                ? [
                    {
                      label: "Resale Plan",
                      value:
                        partner.resalePlan === "direct"
                          ? "Option A — Direct Shipment"
                          : "Option B — Sell on My Behalf",
                      icon: partner.resalePlan === "direct" ? "🚚" : "🏪",
                    },
                  ]
                : []),
              ...(partner.deliveryAddress
                ? [
                    {
                      label: "Delivery Address",
                      value: partner.deliveryAddress,
                      icon: "📍",
                    },
                  ]
                : []),
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 py-2 border-b border-[#c9a84c0a] last:border-0"
              >
                <span className="text-base w-6 text-center">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[#4a6070] text-xs">{label}</p>
                  <p className="text-[#d4c8a8] text-sm font-medium truncate">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings Breakdown (Option B) vs Direct Order & Shipment Details (Option A) */}
        {partner.resalePlan !== "direct" ? (
          <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-6 card-glow flex flex-col justify-between">
            <div>
              <h3
                className="font-display text-lg text-[#e2c97e] mb-5"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Earnings Breakdown
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Monthly Interest Rate",
                    value: "7.00%",
                    sub: "Applied to all currencies equally",
                  },
                  {
                    label: "Monthly Earning",
                    value: fmt(monthlyEarning, viewCurrency),
                    sub: `7% of ${fmt(capital, viewCurrency)}`,
                  },
                  {
                    label: "Quarterly Earning",
                    value: fmt(monthlyEarning * 3, viewCurrency),
                    sub: "3 months return",
                  },
                  {
                    label: "Semi-Annual Earning",
                    value: fmt(monthlyEarning * 6, viewCurrency),
                    sub: "6 months return",
                  },
                  {
                    label: "Annual Projected",
                    value: fmt(annualProjected, viewCurrency),
                    sub: "12 months return (7% × 12)",
                  },
                  {
                    label: "Total Earned to Date",
                    value: fmt(totalEarned, viewCurrency),
                    sub: `${monthsActive} month${
                      monthsActive !== 1 ? "s" : ""
                    } active`,
                    highlight: true,
                  },
                ].map(({ label, value, sub, highlight }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2 border-b border-[#c9a84c0a] last:border-0"
                  >
                    <div>
                      <p
                        className={`text-xs ${
                          highlight ? "text-[#c9a84c]" : "text-[#4a6070]"
                        }`}
                      >
                        {label}
                      </p>
                      <p className="text-[#6a7f8a] text-xs">{sub}</p>
                    </div>
                    <p
                      className={`font-mono font-semibold text-sm ${
                        highlight ? "text-[#e2c97e]" : "text-[#d4c8a8]"
                      }`}
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs text-[#4a6070] mb-2">
                <span>Progress toward first year</span>
                <span>{yearProgress}%</span>
              </div>
              <div className="h-2 bg-[#122040] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#c9a84c] to-[#e2c97e] rounded-full transition-all duration-700"
                  style={{ width: `${yearProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-6 card-glow flex flex-col justify-between">
            <div>
              <h3
                className="font-display text-lg text-[#e2c97e] mb-5"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Direct Shipment Details
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Fulfillment Model",
                    value: "Option A · Direct Physical Delivery",
                    sub: "Dispatched from European central warehouse",
                  },
                  {
                    label: "Ordered Appliance",
                    value: partner.selectedProduct || "Smart Digital Mini Kitchen Appliance",
                    sub: "100% genuine retail quality",
                  },
                  {
                    label: "Total Order Value",
                    value: fmt(capital, viewCurrency),
                    sub: `Paid via Visa / Stripe (${viewCurrency})`,
                    highlight: true,
                  },
                  {
                    label: "Order Status",
                    value: "Confirmed & Active",
                    sub: "Payment verified · Ready for packaging",
                  },
                  {
                    label: "Shipping Window",
                    value: "Est. 6–10 weeks",
                    sub: "International standard freight",
                  },
                ].map(({ label, value, sub, highlight }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2 border-b border-[#c9a84c0a] last:border-0"
                  >
                    <div>
                      <p
                        className={`text-xs ${
                          highlight ? "text-[#c9a84c]" : "text-[#4a6070]"
                        }`}
                      >
                        {label}
                      </p>
                      <p className="text-[#6a7f8a] text-xs">{sub}</p>
                    </div>
                    <p
                      className={`font-mono font-semibold text-sm ${
                        highlight ? "text-[#e2c97e]" : "text-[#d4c8a8]"
                      }`}
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-[#122040] border border-[#c9a84c22] rounded-xl p-3.5 flex items-center gap-3">
              <span className="text-xl">🚚</span>
              <div>
                <p className="text-[#e2c97e] text-xs font-semibold">Packaging in Progress</p>
                <p className="text-[#4a6070] text-[11px]">Your physical order will be tracked with our logistics partner.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {partner.resalePlan !== "direct" && (
        <div className="mb-8">
          <EarningsChart
            capital={capital}
            currency={viewCurrency}
            monthsActive={monthsActive}
          />
        </div>
      )}

      {/* Multi-currency value display */}
      <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-6 card-glow">
        <h3
          className="font-display text-lg text-[#e2c97e] mb-4"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Value in All Currencies
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["EUR", "GBP", "GHS"] as Currency[]).map((c) => {
            const totalEUR = (partner.batches || []).reduce(
              (s, t) => s + t.amountEUR,
              0
            );
            const p = convert(totalEUR, "EUR", c);
            const m = p * MONTHLY_RATE;
            return (
              <div
                key={c}
                className={`bg-[#122040] rounded-xl p-4 border transition-all ${
                  viewCurrency === c
                    ? "border-[#c9a84c44]"
                    : "border-transparent"
                }`}
              >
                <p className="text-[#4a6070] text-xs mb-2">
                  {SYMBOLS[c]} {CURRENCY_NAMES[c]}
                </p>
                <p
                  className="font-mono font-bold text-[#e2c97e] text-lg"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {fmt(p, c)}
                </p>
                {partner.resalePlan !== "direct" && (
                  <p className="text-[#c9a84c] text-xs mt-1">
                    Monthly: {fmt(m, c)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
