import { Currency, StockBatch } from "@/types";
import { fmt } from "@/utils/currency";
import { formatFullDate } from "@/utils/date";

interface BatchCalculated extends StockBatch {
  months: number;
  capitalInView: number;
  monthly: number;
  earned: number;
  firstPayout: string;
}

interface HistoryRow {
  month: string;
  batch: string;
  amount: number;
  status: string;
}

interface DashboardHistoryProps {
  batchData: BatchCalculated[];
  historyRows: HistoryRow[];
  viewCurrency: Currency;
  monthlyEarning: number;
  totalEarned: number;
  startDate: string;
}

export default function DashboardHistory({
  batchData,
  historyRows,
  viewCurrency,
  monthlyEarning,
  totalEarned,
  startDate,
}: DashboardHistoryProps) {
  const startFormatted = formatFullDate(startDate);

  return (
    <div className="space-y-6">
      {/* Per-batch schedule */}
      <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl card-glow overflow-hidden">
        <div className="p-6 border-b border-[#c9a84c12]">
          <h2
            className="font-display text-xl text-[#e2c97e]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Investment Batches & Payout Schedule
          </h2>
          <p className="text-[#4a6070] text-sm mt-1">
            Each stock order earns 7% from its own start date — payouts are 30
            days after each deposit.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#c9a84c0a]">
                <th className="text-left text-xs text-[#4a6070] font-semibold px-6 py-4">
                  #
                </th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-6 py-4">
                  Stocked On
                </th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-6 py-4">
                  Amount
                </th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-6 py-4">
                  First Payout
                </th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-6 py-4">
                  Monthly 7%
                </th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-6 py-4">
                  Via
                </th>
              </tr>
            </thead>
            <tbody>
              {batchData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#4a6070] text-sm">
                    No active investment batches yet.
                  </td>
                </tr>
              ) : (
                batchData.map((t, i) => (
                  <tr
                    key={t.id}
                    className="border-b border-[#c9a84c08] table-row-hover"
                  >
                    <td
                      className="px-6 py-4 font-mono text-xs text-[#4a6070]"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#d4c8a8]">
                      {new Date(t.orderedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td
                      className="px-6 py-4 font-mono font-semibold text-sm text-[#e2c97e]"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {fmt(t.capitalInView, viewCurrency)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#c9a84c]">
                      {t.firstPayout}
                    </td>
                    <td
                      className="px-6 py-4 font-mono text-sm text-[#e2c97e]"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {fmt(t.monthly, viewCurrency)}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#6a7f8a] capitalize">
                      {t.method === "momo" ? "📱 MoMo" : "💳 Card"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {batchData.length > 0 && (
              <tfoot>
                <tr className="bg-[#122040]">
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-xs text-[#4a6070] font-semibold"
                  >
                    TOTAL MONTHLY
                  </td>
                  <td
                    className="px-6 py-4 font-mono font-bold text-[#e2c97e] text-sm"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {fmt(monthlyEarning, viewCurrency)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Monthly payout log */}
      <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl card-glow overflow-hidden">
        <div className="p-6 border-b border-[#c9a84c12]">
          <h3
            className="font-display text-lg text-[#e2c97e]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Monthly Payout Log
          </h3>
          <p className="text-[#4a6070] text-sm mt-1">
            All payouts since {startFormatted}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#c9a84c0a]">
                <th className="text-left text-xs text-[#4a6070] font-semibold px-6 py-4">
                  #
                </th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-6 py-4">
                  Payout Date
                </th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-6 py-4">
                  Batch
                </th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-6 py-4">
                  7% Earned
                </th>
                <th className="text-left text-xs text-[#4a6070] font-semibold px-6 py-4">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {historyRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#4a6070] text-sm">
                    No payout records yet.
                  </td>
                </tr>
              ) : (
                historyRows.map(({ month, batch, amount, status }, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#c9a84c08] table-row-hover"
                  >
                    <td
                      className="px-6 py-4 font-mono text-xs text-[#4a6070]"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#d4c8a8]">{month}</td>
                    <td
                      className="px-6 py-4 font-mono text-xs text-[#8899a6]"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {batch}
                    </td>
                    <td
                      className="px-6 py-4 font-mono font-semibold text-sm text-[#e2c97e]"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {fmt(amount, viewCurrency)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          status === "Paid"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-[#c9a84c22] text-[#c9a84c]"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {historyRows.length > 0 && (
              <tfoot>
                <tr className="bg-[#122040]">
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-xs text-[#4a6070] font-semibold"
                  >
                    TOTAL EARNED TO DATE
                  </td>
                  <td
                    className="px-6 py-4 font-mono font-bold text-[#e2c97e] text-sm"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {fmt(totalEarned, viewCurrency)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
