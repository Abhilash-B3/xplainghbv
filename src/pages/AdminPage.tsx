import { useState, useEffect, useCallback } from 'react';
import { AdminService, AdminUserItem, AdminWithdrawalItem, ReconciliationReportData } from '@/services/adminService';
import { fmt } from '@/utils/currency';

interface AdminPageProps {
  onBack: () => void;
}

type AdminTab = 'users' | 'withdrawals' | 'ledger' | 'reconciliation' | 'audit';

export default function AdminPage({ onBack }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('withdrawals');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Users State
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Withdrawals State
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalItem[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<AdminWithdrawalItem | null>(null);
  const [settlementRef, setSettlementRef] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionModal, setActionModal] = useState<'complete' | 'reject' | null>(null);

  // Ledger & Audits State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reconciliation, setReconciliation] = useState<ReconciliationReportData | null>(null);

  const loadTabData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'users') {
        const res = await AdminService.getUsers({ search: userSearch || undefined });
        setUsers(res.users);
      } else if (activeTab === 'withdrawals') {
        const res = await AdminService.getWithdrawals();
        setWithdrawals(res.withdrawals);
      } else if (activeTab === 'ledger') {
        const res = await AdminService.getLedgerTransactions();
        setTransactions(res.transactions);
      } else if (activeTab === 'reconciliation') {
        const res = await AdminService.getReconciliationReport();
        setReconciliation(res);
      } else if (activeTab === 'audit') {
        const res = await AdminService.getAuditLogs();
        setAuditLogs(res.logs);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, userSearch]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change user status to ${nextStatus}?`)) return;
    try {
      await AdminService.updateUserStatus(userId, nextStatus);
      setSuccessMsg(`User status updated to ${nextStatus}`);
      loadTabData();
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await AdminService.approveWithdrawal(id);
      setSuccessMsg('Withdrawal approved');
      loadTabData();
    } catch (err: any) {
      setError(err.message || 'Failed to approve withdrawal');
    }
  };

  const handleProcess = async (id: string) => {
    try {
      await AdminService.processWithdrawal(id);
      setSuccessMsg('Withdrawal marked as processing');
      loadTabData();
    } catch (err: any) {
      setError(err.message || 'Failed to process withdrawal');
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal || !settlementRef) return;
    try {
      await AdminService.completeWithdrawal(selectedWithdrawal.id, settlementRef);
      setSuccessMsg('Withdrawal completed and settled in double-entry ledger!');
      setActionModal(null);
      setSettlementRef('');
      setSelectedWithdrawal(null);
      loadTabData();
    } catch (err: any) {
      setError(err.message || 'Failed to complete withdrawal');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal || !rejectReason) return;
    try {
      await AdminService.rejectWithdrawal(selectedWithdrawal.id, rejectReason);
      setSuccessMsg('Withdrawal rejected and reserved funds returned to partner available balance');
      setActionModal(null);
      setRejectReason('');
      setSelectedWithdrawal(null);
      loadTabData();
    } catch (err: any) {
      setError(err.message || 'Failed to reject withdrawal');
    }
  };

  return (
    <div className="min-h-screen bg-[#050c1a] text-[#f0ece0]">
      {/* Admin Header */}
      <header className="bg-[#030812] border-b border-[#c9a84c18] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-[#050c1a] text-sm">
              🛡️
            </div>
            <span className="font-display text-[#e2c97e] font-semibold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>
              Xplain GH BV — Administrative Console
            </span>
          </div>
          <button
            onClick={onBack}
            className="text-xs text-[#8899a6] hover:text-[#c9a84c] border border-[#c9a84c22] px-3 py-1.5 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-[#c9a84c18] pb-4 overflow-x-auto">
          {[
            { id: 'withdrawals', label: '💳 Withdrawals Operations' },
            { id: 'users', label: '👥 User Management' },
            { id: 'ledger', label: '⚖️ Financial Ledger' },
            { id: 'reconciliation', label: '📊 Automated Reconciliation' },
            { id: 'audit', label: '📜 Audit Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#c9a84c] text-[#050c1a]'
                  : 'bg-[#0c1830] text-[#8899a6] hover:text-[#c9a84c]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feedback Messages */}
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

        {/* TAB 1: WITHDRAWALS OPERATIONS */}
        {activeTab === 'withdrawals' && (
          <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-6 card-glow">
            <h3 className="text-lg font-bold text-[#e2c97e] mb-4">Withdrawal Review & Settlement Operations</h3>
            {loading ? (
              <p className="text-xs text-[#8899a6]">Loading withdrawals...</p>
            ) : withdrawals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#c9a84c18] text-xs text-[#8899a6]">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c9a84c0a] text-xs">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-[#122040]/40">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[#f0ece0]">{w.partnerProfile.fullName}</p>
                          <p className="text-[10px] text-[#6a7f8a]">{w.partnerProfile.user.email}</p>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#e2c97e]">
                          {fmt(parseFloat(w.amount), w.currency as any)}
                        </td>
                        <td className="py-3 px-4 text-[#8899a6]">
                          {w.destinationType === 'BANK'
                            ? `${w.bankAccount?.bankName || 'Bank'} (${w.bankAccount?.accountNumberMasked || '••••'})`
                            : `${w.moMoAccount?.provider || 'MoMo'} (${w.moMoAccount?.phoneNumberMasked || '••••'})`}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              w.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : w.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-400'
                                : w.status === 'APPROVED' || w.status === 'PROCESSING'
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {w.status}
                          </span>
                          {w.settlementReference && (
                            <p className="text-[10px] font-mono text-emerald-300 mt-0.5">Ref: {w.settlementReference}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#6a7f8a]">
                          {new Date(w.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {w.status === 'PENDING' && (
                              <button
                                onClick={() => handleApprove(w.id)}
                                className="bg-blue-600/80 hover:bg-blue-600 text-white px-2 py-1 rounded text-[10px]"
                              >
                                Approve
                              </button>
                            )}
                            {(w.status === 'PENDING' || w.status === 'APPROVED') && (
                              <button
                                onClick={() => handleProcess(w.id)}
                                className="bg-amber-600/80 hover:bg-amber-600 text-white px-2 py-1 rounded text-[10px]"
                              >
                                Process
                              </button>
                            )}
                            {(w.status === 'APPROVED' || w.status === 'PROCESSING' || w.status === 'PENDING') && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedWithdrawal(w);
                                    setActionModal('complete');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-[10px] font-bold"
                                >
                                  Complete (Settle)
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedWithdrawal(w);
                                    setActionModal('reject');
                                  }}
                                  className="bg-red-600/80 hover:bg-red-600 text-white px-2 py-1 rounded text-[10px]"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[#8899a6]">No withdrawals found.</p>
            )}
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-6 card-glow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#e2c97e]">Registered Users</h3>
              <input
                type="text"
                placeholder="Search email, name..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-[#122040] border border-[#c9a84c22] rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#c9a84c18] text-[#8899a6]">
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Ref Code</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c9a84c0a]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#122040]/40">
                        <td className="py-3 px-4 font-semibold text-[#f0ece0]">{u.partnerProfile?.fullName || '—'}</td>
                        <td className="py-3 px-4 text-[#8899a6]">{u.email}</td>
                        <td className="py-3 px-4 font-mono text-[#c9a84c]">{u.role}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">{u.partnerProfile?.referralCode || '—'}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleStatusChange(u.id, u.status)}
                            className="text-[10px] text-amber-400 hover:underline"
                          >
                            Toggle Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[#8899a6]">No users found.</p>
            )}
          </div>
        )}

        {/* TAB 3: LEDGER INSPECTOR */}
        {activeTab === 'ledger' && (
          <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-6 card-glow">
            <h3 className="text-lg font-bold text-[#e2c97e] mb-4">Double-Entry Ledger Transactions</h3>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="bg-[#122040] p-4 rounded-xl border border-[#c9a84c18] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#c9a84c]">{tx.referenceNumber}</span>
                      <span className="text-[#6a7f8a]">{new Date(tx.createdAt).toLocaleString('en-GB')}</span>
                    </div>
                    <p className="text-xs text-[#8899a6]">{tx.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-[#c9a84c0a]">
                      {tx.entries?.map((e: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-[11px] p-2 bg-[#0c1830] rounded">
                          <span className={e.entryType === 'DEBIT' ? 'text-blue-400' : 'text-emerald-400'}>
                            {e.entryType}: {e.account?.accountType || 'ACCOUNT'}
                          </span>
                          <span className="font-mono font-bold text-[#f0ece0]">
                            {fmt(parseFloat(e.amountEUR), 'EUR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8899a6]">No ledger transactions found.</p>
            )}
          </div>
        )}

        {/* TAB 4: RECONCILIATION */}
        {activeTab === 'reconciliation' && (
          <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-6 card-glow space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#e2c97e]">Financial Ledger Reconciliation Audit</h3>
              <button
                onClick={loadTabData}
                className="bg-[#c9a84c] text-[#050c1a] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#e2c97e]"
              >
                Run Audit Now 🔄
              </button>
            </div>

            {reconciliation && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    reconciliation.isBalanced
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  <p className="font-bold text-sm">
                    {reconciliation.isBalanced ? '✅ All Financial Accounts in Perfect Balance' : '⚠️ Discrepancy Detected'}
                  </p>
                  <p className="text-xs mt-1">Audit executed at: {new Date(reconciliation.timestamp).toLocaleString('en-GB')}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#122040] p-4 rounded-xl">
                    <p className="text-[10px] text-[#8899a6] uppercase">Total Debits</p>
                    <p className="font-mono font-bold text-sm text-[#f0ece0]">{reconciliation.totalDebitsEUR} EUR</p>
                  </div>
                  <div className="bg-[#122040] p-4 rounded-xl">
                    <p className="text-[10px] text-[#8899a6] uppercase">Total Credits</p>
                    <p className="font-mono font-bold text-sm text-[#f0ece0]">{reconciliation.totalCreditsEUR} EUR</p>
                  </div>
                  <div className="bg-[#122040] p-4 rounded-xl">
                    <p className="text-[10px] text-[#8899a6] uppercase">Platform Escrow Asset</p>
                    <p className="font-mono font-bold text-sm text-emerald-400">{reconciliation.platformEscrowBalanceEUR} EUR</p>
                  </div>
                  <div className="bg-[#122040] p-4 rounded-xl">
                    <p className="text-[10px] text-[#8899a6] uppercase">Locked Capital</p>
                    <p className="font-mono font-bold text-sm text-[#c9a84c]">{reconciliation.lockedCapitalBalanceEUR} EUR</p>
                  </div>
                </div>

                {reconciliation.discrepancies.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-2">
                    <p className="font-bold text-xs text-red-400">Audit Discrepancies ({reconciliation.discrepanciesCount})</p>
                    {reconciliation.discrepancies.map((d, i) => (
                      <p key={i} className="text-xs text-red-300">• {d}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-6 card-glow">
            <h3 className="text-lg font-bold text-[#e2c97e] mb-4">Immutable Audit Trail</h3>
            {auditLogs.length > 0 ? (
              <div className="space-y-2 font-mono text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-[#122040] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[#c9a84c] font-bold">{log.action}</span>
                      <span className="text-[#8899a6] ml-2">on {log.entityType} ({log.entityId})</span>
                    </div>
                    <div className="text-[10px] text-[#6a7f8a]">
                      <span>{log.user?.email || 'System'}</span> · {new Date(log.createdAt).toLocaleString('en-GB')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8899a6]">No audit logs found.</p>
            )}
          </div>
        )}
      </div>

      {/* MODAL: COMPLETE WITHDRAWAL WITH SETTLEMENT REFERENCE */}
      {actionModal === 'complete' && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0c1830] border border-[#c9a84c44] rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-base text-[#e2c97e]">Complete Withdrawal Settlement</h3>
            <p className="text-xs text-[#8899a6]">
              To complete withdrawal of <strong className="text-white">{fmt(parseFloat(selectedWithdrawal.amount), selectedWithdrawal.currency as any)}</strong> for {selectedWithdrawal.partnerProfile.fullName}, provide the verified bank transfer reference or provider transaction ID.
            </p>
            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#8899a6] mb-1">Settlement Reference *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BANK-TRF-9817234 or STRIPE-TX-001"
                  value={settlementRef}
                  onChange={(e) => setSettlementRef(e.target.value)}
                  className="w-full bg-[#122040] border border-[#c9a84c22] rounded-xl p-3 text-xs text-white font-mono"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="flex-1 bg-[#122040] text-[#8899a6] py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  Confirm & Settle Ledger →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REJECT WITHDRAWAL */}
      {actionModal === 'reject' && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0c1830] border border-red-500/40 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-base text-red-400">Reject Withdrawal Request</h3>
            <p className="text-xs text-[#8899a6]">
              Rejecting will return reserved funds back to the partner&apos;s available returns account. Please enter a valid reason.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#8899a6] mb-1">Rejection Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Invalid bank account details provided"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#122040] border border-red-500/30 rounded-xl p-3 text-xs text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="flex-1 bg-[#122040] text-[#8899a6] py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  Confirm Rejection & Release Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
