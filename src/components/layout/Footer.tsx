import { View } from "@/types";

interface FooterProps {
  onLegal: (view: View) => void;
}

export default function Footer({ onLegal }: FooterProps) {
  return (
    <footer className="bg-[#030812] border-t border-[#c9a84c18] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#c9a84c] rounded-lg flex items-center justify-center">
              <span className="text-[#050c1a] font-bold text-xs">X</span>
            </div>
            <span
              className="font-display text-[#e2c97e]"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              Xplain GH BV
            </span>
          </div>
          <p className="text-[#4a6070] text-xs text-center">
            3 Route de la Baie, St. Brelade, Jersey Island &nbsp;·&nbsp;
            sales@xplainghbv.com
          </p>
          <p className="text-[#4a6070] text-xs">
            © 2026 Xplain GH BV. All rights reserved.
          </p>
        </div>
        <div className="border-t border-[#c9a84c0a] pt-6 flex flex-wrap items-center justify-center gap-6">
          {(
            [
              { label: "Privacy Policy", view: "privacy" },
              { label: "Cookie Policy", view: "cookies" },
              { label: "Terms of Service", view: "terms" },
              { label: "Safeguarding", view: "safeguarding" },
            ] as { label: string; view: View }[]
          ).map(({ label, view }) => (
            <button
              key={view}
              onClick={() => onLegal(view)}
              className="text-[#4a6070] hover:text-[#c9a84c] text-xs transition-colors underline underline-offset-2"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
