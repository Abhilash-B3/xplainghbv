import { useState } from "react";
import { Currency } from "@/types";
import { MONTHLY_RATE, SYMBOLS, fmt } from "@/utils/currency";

export default function Calculator() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const parsed = parseFloat(amount.replace(/,/g, "")) || 0;
  const monthly = parsed * MONTHLY_RATE;
  const annual = monthly * 12;

  return (
    <div className="bg-[#0c1830] border border-[#c9a84c22] rounded-2xl p-8 card-glow max-w-lg mx-auto">
      <h3
        className="font-display text-2xl text-[#e2c97e] mb-6"
        style={{ fontFamily: "Fraunces, Georgia, serif" }}
      >
        Earnings Calculator
      </h3>
      <div className="flex gap-3 mb-4">
        {(["EUR", "GBP", "GHS"] as Currency[]).map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              currency === c
                ? "bg-[#c9a84c] text-[#050c1a]"
                : "bg-[#122040] text-[#8899a6] hover:text-[#c9a84c]"
            }`}
          >
            {SYMBOLS[c]} {c}
          </button>
        ))}
      </div>
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c9a84c] font-mono text-lg">
          {SYMBOLS[currency]}
        </span>
        <input
          type="number"
          placeholder="Enter stock value"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-[#122040] border border-[#c9a84c22] rounded-xl pl-10 pr-4 py-4 text-white placeholder-[#4a5568] font-mono text-lg input-gold transition-all"
        />
      </div>
      {parsed > 0 && (
        <div className="space-y-3 pt-2">
          <div className="gold-line" />
          <div className="pt-3 grid grid-cols-2 gap-4">
            <div className="bg-[#122040] rounded-xl p-4">
              <p className="text-[#8899a6] text-xs mb-1">Monthly Profit</p>
              <p
                className="font-mono font-semibold text-[#e2c97e] text-xl"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {fmt(monthly, currency)}
              </p>
              <p className="text-[#c9a84c] text-xs mt-1">7% / month</p>
            </div>
            <div className="bg-[#122040] rounded-xl p-4">
              <p className="text-[#8899a6] text-xs mb-1">Annual Profit</p>
              <p
                className="font-mono font-semibold text-[#e2c97e] text-xl"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {fmt(annual, currency)}
              </p>
              <p className="text-[#c9a84c] text-xs mt-1">7% × 12 months</p>
            </div>
          </div>
          <div className="bg-[#0a1a35] border border-[#c9a84c33] rounded-xl p-4 mt-2">
            <p className="text-[#8899a6] text-xs mb-2">
              After 12 months, your portfolio value:
            </p>
            <p
              className="font-mono font-bold text-[#e2c97e] text-2xl"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {fmt(parsed + annual, currency)}
            </p>
            <p className="text-[#c9a84c] text-xs mt-1">
              Capital + {fmt(annual, currency)} in returns
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
