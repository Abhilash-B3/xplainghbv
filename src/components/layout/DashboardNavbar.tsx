import { PartnerProfile } from "@/types";
import NotificationBell from "@/components/notifications/NotificationBell";

interface DashboardNavbarProps {
  partner: PartnerProfile;
  activeSection: "overview" | "history" | "withdraw" | "referral" | "addstock";
  onSelectSection: (section: "overview" | "history" | "withdraw" | "referral" | "addstock") => void;
  onBack: () => void;
  onLogout: () => void;
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
}

export default function DashboardNavbar({
  partner,
  activeSection,
  onSelectSection,
  onBack,
  onLogout,
  onOpenAdmin,
  isAdmin = false,
}: DashboardNavbarProps) {
  const sections = [
    "overview",
    "history",
    ...(partner.resalePlan === "sellfor" ? ["addstock"] : []),
    "withdraw",
    "referral",
  ] as const;

  return (
    <nav className="bg-[#030812] border-b border-[#c9a84c18] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#c9a84c] rounded-lg flex items-center justify-center">
            <span className="text-[#050c1a] font-bold text-sm">X</span>
          </div>
          <span
            className="font-display text-[#e2c97e] hidden sm:block"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Xplain GH BV
          </span>
        </div>
        <div className="flex items-center gap-1 bg-[#0c1830] rounded-xl p-1">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => onSelectSection(s as typeof activeSection)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeSection === s
                  ? s === "addstock"
                    ? "bg-emerald-500 text-white"
                    : "bg-[#c9a84c] text-[#050c1a]"
                  : s === "addstock"
                  ? "text-emerald-500 hover:text-emerald-400"
                  : "text-[#6a7f8a] hover:text-[#c9a84c]"
              }`}
            >
              {s === "addstock" ? "+ Add Stock" : s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real Notification Bell */}
          <NotificationBell />

          {/* Admin Portal Button */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all font-semibold"
            >
              🛡️ Admin
            </button>
          )}

          <div className="text-right hidden sm:block">
            <p className="text-[#e2c97e] text-xs font-semibold">
              {partner.name.split(" ")[0]}
            </p>
            <p className="text-[#4a6070] text-xs">{partner.email}</p>
          </div>
          <button
            onClick={onBack}
            className="text-xs text-[#4a6070] hover:text-[#e2c97e] transition-colors border border-[#c9a84c22] px-3 py-1.5 rounded-lg hover:border-[#c9a84c44] flex items-center gap-1"
          >
            <span>←</span>
            <span className="hidden sm:inline">
              {partner.resalePlan === "sellfor" ? "Edit Products" : "Home"}
            </span>
          </button>
          <button
            onClick={onLogout}
            className="text-xs text-[#4a6070] hover:text-[#c9a84c] transition-colors border border-[#c9a84c22] px-3 py-1.5 rounded-lg hover:border-[#c9a84c]"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
