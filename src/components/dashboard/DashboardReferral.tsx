import { useState, useEffect, useCallback } from "react";
import { Currency } from "@/types";
import { fmt } from "@/utils/currency";
import { ReferralService, ReferralSummaryResponse } from "@/services/referralService";

interface DashboardReferralProps {
  referralCode: string;
  viewCurrency: Currency;
}

export default function DashboardReferral({
  referralCode: initialCode,
  viewCurrency,
}: DashboardReferralProps) {
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState<ReferralSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReferralService.getSummary(viewCurrency);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || "Failed to load referral details");
    } finally {
      setLoading(false);
    }
  }, [viewCurrency]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const activeCode = summary?.referralCode || initialCode;
  const refLink = `https://xplainghbv.com/ref/${activeCode}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Referral Link Card */}
      <div className="bg-[#0c1830] border border-[#c9a84c22] rounded-2xl p-6 card-glow">
        <h2
          className="font-display text-2xl text-[#e2c97e] mb-2"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Your Referral Link
        </h2>
        <p className="text-[#4a6070] text-sm mb-1">
          Share your unique partner link. Every month your referred partner stays
          active, you earn{" "}
          <span className="text-[#c9a84c] font-semibold">3%</span> of their
          qualifying appliance capital —{" "}
          <span className="text-[#e2c97e] font-semibold">
            paid monthly to your available returns
          </span>
          .
        </p>
        <p className="text-[#4a6070] text-xs mb-5">
          Your referral code:{" "}
          <span
            className="font-mono text-[#c9a84c] font-semibold"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {activeCode}
          </span>
        </p>
        <div className="flex gap-2">
          <div
            className="flex-1 bg-[#122040] border border-[#c9a84c22] rounded-xl px-4 py-3 font-mono text-sm text-[#6a7f8a] truncate"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {refLink}
          </div>
          <button
            onClick={handleCopy}
            className="bg-[#c9a84c] text-[#050c1a] font-bold px-5 py-3 rounded-xl text-xs hover:bg-[#e2c97e] transition-all whitespace-nowrap"
          >
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Referrals",
            value: summary ? String(summary.totalReferrals) : "0",
            icon: "👥",
          },
          {
            label: "Active Partners",
            value: summary ? String(summary.activeReferrals) : "0",
            icon: "✨",
          },
          {
            label: "Est. Monthly Bonus",
            value: summary ? fmt(parseFloat(summary.monthlyEstimatedBonusInView), viewCurrency) : fmt(0, viewCurrency),
            icon: "💸",
            highlight: true,
          },
        ].map(({ label, value, icon, highlight }) => (
          <div
            key={label}
            className={`rounded-2xl p-4 card-glow text-center border ${
              highlight
                ? "bg-[#c9a84c18] border-[#c9a84c44]"
                : "bg-[#0c1830] border-[#c9a84c18]"
            }`}
          >
            <div className="text-2xl mb-2">{icon}</div>
            <p
              className={`font-mono font-bold text-lg ${
                highlight ? "text-[#c9a84c]" : "text-[#e2c97e]"
              }`}
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {loading ? "..." : value}
            </p>
            <p className="text-[#4a6070] text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Referred Partners List */}
      <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl overflow-hidden card-glow">
        <div className="p-5 border-b border-[#c9a84c12]">
          <h3
            className="font-display text-lg text-[#e2c97e]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Referred Partners
          </h3>
          <p className="text-[#4a6070] text-xs mt-1">
            Real attributed referee profiles and active capital status
          </p>
        </div>

        {summary && summary.referees.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#c9a84c0a]">
                <th className="text-left text-xs text-[#4a6070] font-semibold px-5 py-3">Referee</th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-5 py-3">Active Capital</th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-5 py-3">3%/Month</th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.referees.map((r) => (
                <tr key={r.referralId} className="border-b border-[#c9a84c08] table-row-hover">
                  <td className="px-5 py-3.5 text-sm text-[#d4c8a8]">{r.refereeName}</td>
                  <td className="px-5 py-3.5 font-mono text-sm text-[#8899a6]">
                    {fmt(parseFloat(r.capitalInView), viewCurrency)}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-sm text-[#e2c97e]">
                    {r.status === "Active" ? fmt(parseFloat(r.monthlyBonusInView), viewCurrency) : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        r.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-[#c9a84c22] text-[#c9a84c]"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-[#6a7f8a] text-center py-6">
            {loading ? "Loading referral network..." : "No partners referred yet. Share your unique link to start earning!"}
          </p>
        )}
      </div>

      {/* Commission Earnings History */}
      <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl overflow-hidden card-glow">
        <div className="p-5 border-b border-[#c9a84c12]">
          <h3
            className="font-display text-lg text-[#e2c97e]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Commission Earnings History
          </h3>
          <p className="text-[#4a6070] text-xs mt-1">
            Authoritative double-entry ledger commission disbursements
          </p>
        </div>

        {summary && summary.commissions.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#c9a84c0a]">
                <th className="text-left text-xs text-[#4a6070] font-semibold px-5 py-3">Month</th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-5 py-3">Referee</th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-5 py-3">Commission</th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.commissions.map((c) => (
                <tr key={c.id} className="border-b border-[#c9a84c08] table-row-hover">
                  <td className="px-5 py-3.5 font-mono text-xs text-[#8899a6]">{c.periodMonth}</td>
                  <td className="px-5 py-3.5 text-sm text-[#d4c8a8]">{c.refereeName}</td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-sm text-emerald-400">
                    +{fmt(parseFloat(c.amountInView), viewCurrency)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-[#6a7f8a] text-center py-6">
            No commission disbursements recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}
