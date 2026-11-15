import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Currency } from "@/types";
import { fmt, MONTHLY_RATE } from "@/utils/currency";

interface EarningsChartProps {
  capital: number;
  currency: Currency;
  monthsActive: number;
}

export default function EarningsChart({
  capital,
  currency,
  monthsActive,
}: EarningsChartProps) {
  const chartData = useMemo(() => {
    const data = [];
    const monthlyReturn = capital * MONTHLY_RATE;
    const totalMonths = Math.max(12, monthsActive + 6);

    for (let m = 1; m <= totalMonths; m++) {
      const cumulativeReturns = monthlyReturn * m;
      const totalPortfolio = capital + cumulativeReturns;
      data.push({
        month: `M${m}`,
        label: `Month ${m}`,
        returns: Math.round(cumulativeReturns),
        total: Math.round(totalPortfolio),
      });
    }
    return data;
  }, [capital, monthsActive]);

  if (capital <= 0) return null;

  return (
    <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-6 card-glow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="font-display text-lg text-[#e2c97e]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Projected Portfolio Growth
          </h3>
          <p className="text-[#4a6070] text-xs mt-0.5">
            Cumulative 7% monthly profit progression over time
          </p>
        </div>
        <span className="text-xs font-mono font-semibold text-[#c9a84c] bg-[#c9a84c14] border border-[#c9a84c33] px-2.5 py-1 rounded-full">
          7.0% / Month
        </span>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#c9a84c" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              stroke="#4a6070"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#c9a84c18" }}
            />
            <YAxis
              stroke="#4a6070"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#c9a84c18" }}
              tickFormatter={(v) => fmt(v, currency)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0c1830] border border-[#c9a84c44] rounded-xl p-3 shadow-xl text-xs space-y-1">
                      <p className="font-semibold text-[#e2c97e]">
                        {data.label}
                      </p>
                      <p className="text-[#8899a6]">
                        Returns:{" "}
                        <span className="font-mono text-[#c9a84c] font-semibold">
                          {fmt(data.returns, currency)}
                        </span>
                      </p>
                      <p className="text-[#8899a6]">
                        Total Value:{" "}
                        <span className="font-mono text-white font-semibold">
                          {fmt(data.total, currency)}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#c9a84c"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#goldGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
