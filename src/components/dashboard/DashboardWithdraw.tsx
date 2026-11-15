import { useState, useEffect, useCallback } from "react";
import { Currency, StockBatch } from "@/types";
import { fmt, SYMBOLS, convert } from "@/utils/currency";
import { WithdrawalService, WithdrawalRecord, WithdrawableBalanceResponse } from "@/services/withdrawalService";
import { DestinationService, BankAccountRecord, MoMoAccountRecord } from "@/services/destinationService";

interface BatchCalculated extends StockBatch {
  months: number;
  capitalInView: number;
  monthly: number;
  earned: number;
  firstPayout: string;
}

interface DashboardWithdrawProps {
  batchData: BatchCalculated[];
  viewCurrency: Currency;
  capital: number;
  totalEarned: number;
}

export default function DashboardWithdraw({
  batchData,
  viewCurrency,
  capital,
}: DashboardWithdrawProps) {
  const [balanceData, setBalanceData] = useState<WithdrawableBalanceResponse | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountRecord[]>([]);
  const [momoAccounts, setMoMoAccounts] = useState<MoMoAccountRecord[]>([]);
  const [selectedDestType, setSelectedDestType] = useState<"BANK" | "MOMO">("BANK");
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [selectedMoMoId, setSelectedMoMoId] = useState<string>("");

  // New Destination Form States
  const [showAddDest, setShowAddDest] = useState(false);
  const [newBank, setNewBank] = useState({
    bankName: "",
    accountNumber: "",
    sortCodeOrSwift: "",
    accountHolderName: "",
  });
  const [newMoMo, setNewMoMo] = useState({
    provider: "MTN_MOMO" as const,
    phoneNumber: "",
    accountHolderName: "",
  });

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [bal, history, banks, momos] = await Promise.all([
        WithdrawalService.getBalance().catch(() => null),
        WithdrawalService.getMyWithdrawals().catch(() => []),
        DestinationService.listBankAccounts().catch(() => []),
        DestinationService.listMoMoAccounts().catch(() => []),
      ]);

      if (bal) setBalanceData(bal);
      setWithdrawals(history);
      setBankAccounts(banks);
      setMoMoAccounts(momos);

      if (banks.length > 0 && !selectedBankId) {
        setSelectedBankId(banks[0].id);
      }
      if (momos.length > 0 && !selectedMoMoId) {
        setSelectedMoMoId(momos[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load withdrawal data");
    } finally {
      setLoading(false);
    }
  }, [selectedBankId, selectedMoMoId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derive authoritative amounts from ledger balance response
  const withdrawableEUR = balanceData
    ? parseFloat(balanceData.availableReturnsEUR)
    : 0;
  const unlockedCapitalEUR = balanceData
    ? parseFloat(balanceData.unlockedCapitalEUR)
    : 0;

  const withdrawableReturnsInView = convert(withdrawableEUR, "EUR", viewCurrency);
  const unlockedCapitalInView = convert(unlockedCapitalEUR, "EUR", viewCurrency);

  // Per-batch capital lock calculations
  const now = new Date();
  const batchUnlock = batchData.map((t) => {
    const unlock = new Date(t.orderedAt);
    unlock.setFullYear(unlock.getFullYear() + 1);
    const locked = now < unlock;
    return { ...t, unlockDate: unlock, locked };
  });

  const lockedCapital = Math.max(0, capital - unlockedCapitalInView);
  const nextUnlock = batchUnlock.find((t) => t.locked);

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (selectedDestType === "BANK") {
        const added = await DestinationService.addBankAccount(newBank);
        setBankAccounts((prev) => [added, ...prev]);
        setSelectedBankId(added.id);
      } else {
        const added = await DestinationService.addMoMoAccount(newMoMo);
        setMoMoAccounts((prev) => [added, ...prev]);
        setSelectedMoMoId(added.id);
      }
      setShowAddDest(false);
      setSuccessMsg("Withdrawal destination saved successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to add destination");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(withdrawAmount);
    if (isNaN(num) || num <= 0) {
      setError("Please enter a valid withdrawal amount");
      return;
    }

    if (selectedDestType === "BANK" && !selectedBankId) {
      setError("Please select or add a bank account destination");
      return;
    }

    if (selectedDestType === "MOMO" && !selectedMoMoId) {
      setError("Please select or add a Mobile Money destination");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await WithdrawalService.requestWithdrawal({
        withdrawalType: "RETURNS",
        amount: num,
        currency: viewCurrency,
        destinationType: selectedDestType,
        bankAccountId: selectedDestType === "BANK" ? selectedBankId : undefined,
        moMoAccountId: selectedDestType === "MOMO" ? selectedMoMoId : undefined,
      });

      setSuccessMsg("Withdrawal request created and funds safely reserved!");
      setWithdrawAmount("");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Withdrawal failed. Please check your available balance.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelWithdrawal = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this withdrawal request? Reserved funds will be returned immediately.")) {
      return;
    }

    try {
      await WithdrawalService.cancelWithdrawal(id);
      setSuccessMsg("Withdrawal cancelled and funds returned to your balance");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to cancel withdrawal");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Balance summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0c1830] border border-emerald-500/30 rounded-2xl p-5 card-glow">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Available to Withdraw
          </p>
          <p
            className="font-mono font-bold text-emerald-400 text-2xl"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {fmt(withdrawableReturnsInView, viewCurrency)}
          </p>
          <p className="text-[#4a6070] text-xs mt-1">
            Authoritative balance · Double-entry ledger
          </p>
        </div>
        <div
          className={`rounded-2xl p-5 card-glow border ${
            lockedCapital > 0
              ? "bg-[#0c1830] border-red-500/20"
              : "bg-[#0c1830] border-emerald-500/30"
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
              lockedCapital > 0 ? "text-red-400" : "text-emerald-400"
            }`}
          >
            Capital {lockedCapital > 0 ? "🔒 Locked" : "✓ Unlocked"}
          </p>
          <p
            className="font-mono font-bold text-[#e2c97e] text-2xl"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {fmt(capital, viewCurrency)}
          </p>
          <p className="text-[#4a6070] text-xs mt-1">
            {lockedCapital > 0 && nextUnlock
              ? `Earliest unlock: ${nextUnlock.unlockDate.toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "short", year: "numeric" }
                )}`
              : "Full 1-year period complete"}
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
          {successMsg}
        </div>
      )}

      {/* Withdrawal Form Card */}
      <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-6 card-glow">
        <h2
          className="font-display text-xl text-[#e2c97e] mb-1"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Request Withdrawal
        </h2>
        <p className="text-[#4a6070] text-sm mb-5">
          Withdraw earned monthly returns directly to your bank account or Mobile Money.
        </p>

        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          {/* Destination Type Toggle */}
          <div className="flex gap-2">
            {[
              { val: "BANK", label: "🏦 Bank Transfer" },
              { val: "MOMO", label: "📱 Mobile Money" },
            ].map(({ val, label }) => (
              <button
                type="button"
                key={val}
                onClick={() => {
                  setSelectedDestType(val as "BANK" | "MOMO");
                  setShowAddDest(false);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDestType === val
                    ? "bg-[#c9a84c] text-[#050c1a]"
                    : "bg-[#122040] text-[#6a7f8a] hover:text-[#c9a84c]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Destination Picker */}
          {selectedDestType === "BANK" ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-[#8899a6]">Saved Bank Accounts</label>
                <button
                  type="button"
                  onClick={() => setShowAddDest(!showAddDest)}
                  className="text-xs text-[#c9a84c] hover:underline"
                >
                  {showAddDest ? "Cancel" : "+ Add New Bank"}
                </button>
              </div>

              {!showAddDest && (
                bankAccounts.length > 0 ? (
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full bg-[#122040] border border-[#c9a84c22] rounded-xl px-4 py-3 text-white text-sm input-gold"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} · {b.accountNumberMasked} ({b.accountHolderName})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-[#6a7f8a] p-3 bg-[#122040] rounded-xl border border-[#c9a84c18]">
                    No bank accounts saved yet. Click &quot;+ Add New Bank&quot; above to add one.
                  </p>
                )
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-[#8899a6]">Saved MoMo Destinations</label>
                <button
                  type="button"
                  onClick={() => setShowAddDest(!showAddDest)}
                  className="text-xs text-[#c9a84c] hover:underline"
                >
                  {showAddDest ? "Cancel" : "+ Add MoMo Number"}
                </button>
              </div>

              {!showAddDest && (
                momoAccounts.length > 0 ? (
                  <select
                    value={selectedMoMoId}
                    onChange={(e) => setSelectedMoMoId(e.target.value)}
                    className="w-full bg-[#122040] border border-[#c9a84c22] rounded-xl px-4 py-3 text-white text-sm input-gold"
                  >
                    {momoAccounts.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.provider} · {m.phoneNumberMasked} ({m.accountHolderName})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-[#6a7f8a] p-3 bg-[#122040] rounded-xl border border-[#c9a84c18]">
                    No MoMo accounts saved yet. Click &quot;+ Add MoMo Number&quot; above to add one.
                  </p>
                )
              )}
            </div>
          )}

          {/* Add Destination Form Inline */}
          {showAddDest && (
            <div className="bg-[#122040] border border-[#c9a84c33] rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-[#e2c97e]">
                {selectedDestType === "BANK" ? "Add Bank Account Destination" : "Add MoMo Destination"}
              </p>
              {selectedDestType === "BANK" ? (
                <>
                  <input
                    placeholder="Bank Name (e.g. Ecobank, Barclays)"
                    value={newBank.bankName}
                    onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                    required
                    className="w-full bg-[#0c1830] border border-[#c9a84c22] rounded-xl px-4 py-2 text-white text-xs"
                  />
                  <input
                    placeholder="Account Number"
                    value={newBank.accountNumber}
                    onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                    required
                    className="w-full bg-[#0c1830] border border-[#c9a84c22] rounded-xl px-4 py-2 text-white text-xs font-mono"
                  />
                  <input
                    placeholder="Sort Code / SWIFT"
                    value={newBank.sortCodeOrSwift}
                    onChange={(e) => setNewBank({ ...newBank, sortCodeOrSwift: e.target.value })}
                    required
                    className="w-full bg-[#0c1830] border border-[#c9a84c22] rounded-xl px-4 py-2 text-white text-xs font-mono"
                  />
                  <input
                    placeholder="Account Holder Full Name"
                    value={newBank.accountHolderName}
                    onChange={(e) => setNewBank({ ...newBank, accountHolderName: e.target.value })}
                    required
                    className="w-full bg-[#0c1830] border border-[#c9a84c22] rounded-xl px-4 py-2 text-white text-xs"
                  />
                </>
              ) : (
                <>
                  <select
                    value={newMoMo.provider}
                    onChange={(e) => setNewMoMo({ ...newMoMo, provider: e.target.value as any })}
                    className="w-full bg-[#0c1830] border border-[#c9a84c22] rounded-xl px-4 py-2 text-white text-xs"
                  >
                    <option value="MTN_MOMO">MTN Mobile Money</option>
                    <option value="VODAFONE_CASH">Vodafone Cash</option>
                    <option value="AIRTELTIGO_MONEY">AirtelTigo Money</option>
                  </select>
                  <input
                    placeholder="MoMo Phone Number (+233 XX XXX XXXX)"
                    value={newMoMo.phoneNumber}
                    onChange={(e) => setNewMoMo({ ...newMoMo, phoneNumber: e.target.value })}
                    required
                    className="w-full bg-[#0c1830] border border-[#c9a84c22] rounded-xl px-4 py-2 text-white text-xs font-mono"
                  />
                  <input
                    placeholder="Registered Full Name"
                    value={newMoMo.accountHolderName}
                    onChange={(e) => setNewMoMo({ ...newMoMo, accountHolderName: e.target.value })}
                    required
                    className="w-full bg-[#0c1830] border border-[#c9a84c22] rounded-xl px-4 py-2 text-white text-xs"
                  />
                </>
              )}
              <button
                type="button"
                onClick={handleAddDestination}
                disabled={submitting}
                className="w-full bg-[#c9a84c] text-[#050c1a] font-bold py-2.5 rounded-xl text-xs hover:bg-[#e2c97e] transition-all"
              >
                {submitting ? "Saving Destination..." : "Save Destination →"}
              </button>
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-xs text-[#8899a6] mb-1.5">
              Amount to Withdraw (max {fmt(withdrawableReturnsInView, viewCurrency)})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c9a84c] font-mono text-sm">
                {SYMBOLS[viewCurrency]}
              </span>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-[#122040] border border-[#c9a84c22] rounded-xl pl-8 pr-4 py-3 text-white text-sm font-mono input-gold"
                placeholder={`0.00 – ${fmt(withdrawableReturnsInView, viewCurrency)}`}
                max={withdrawableReturnsInView}
                step="any"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={withdrawableReturnsInView <= 0 || submitting || loading}
            className="w-full bg-[#c9a84c] text-[#050c1a] font-bold py-4 rounded-xl hover:bg-[#e2c97e] transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Reserving Funds in Ledger..." : "Submit Withdrawal Request →"}
          </button>
        </form>
      </div>

      {/* Real Withdrawal Requests History */}
      <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-6 card-glow">
        <h3
          className="font-display text-lg text-[#e2c97e] mb-4"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Withdrawal Requests History
        </h3>

        {withdrawals.length > 0 ? (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between p-3.5 bg-[#122040] rounded-xl border border-[#c9a84c12]"
              >
                <div>
                  <p className="text-sm font-semibold text-[#f0ece0]">
                    {fmt(parseFloat(w.amount), w.currency)}
                  </p>
                  <p className="text-[#4a6070] text-xs">
                    {new Date(w.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })} · {w.destinationType === "BANK" ? `Bank: ${w.bankAccount?.bankName || "Transfer"}` : `MoMo: ${w.moMoAccount?.provider || "Mobile"}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      w.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : w.status === "PENDING" || w.status === "APPROVED" || w.status === "PROCESSING"
                        ? "bg-[#c9a84c22] text-[#c9a84c]"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {w.status}
                  </span>
                  {w.status === "PENDING" && (
                    <button
                      onClick={() => handleCancelWithdrawal(w.id)}
                      className="text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#6a7f8a] text-center py-4">
            No withdrawal requests submitted yet.
          </p>
        )}
      </div>
    </div>
  );
}
