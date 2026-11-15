import { LEGAL_CONTENT } from "@/constants/legalContent";

interface LegalPageProps {
  page: string;
  onBack: () => void;
  onSelectLegalPage?: (page: string) => void;
}

export default function LegalPage({
  page,
  onBack,
  onSelectLegalPage,
}: LegalPageProps) {
  const content = LEGAL_CONTENT[page];
  if (!content) return null;

  return (
    <div className="min-h-screen bg-[#050c1a] text-[#f0ece0]">
      <nav className="bg-[#030812] border-b border-[#c9a84c18] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 flex items-center gap-4 h-14">
          <button
            onClick={onBack}
            className="text-[#4a6070] hover:text-[#c9a84c] text-sm flex items-center gap-1.5 transition-colors"
          >
            ← Back
          </button>
          <div className="w-px h-5 bg-[#c9a84c22]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#c9a84c] rounded-md flex items-center justify-center">
              <span className="text-[#050c1a] font-bold text-xs">X</span>
            </div>
            <span
              className="font-display text-[#e2c97e] text-sm"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              Xplain GH BV
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-14">
        <h1
          className="font-display text-4xl text-[#e2c97e] mb-2"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          {content.title}
        </h1>
        <p className="text-[#4a6070] text-sm mb-12">
          Last updated: September 2026 &nbsp;·&nbsp; Xplain GH BV &nbsp;·&nbsp; 3
          Route de la Baie, St. Brelade, Jersey Island
        </p>

        <div className="space-y-10">
          {content.sections.map(({ heading, body }) => (
            <div key={heading}>
              <h2
                className="font-display text-lg text-[#c9a84c] mb-3"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                {heading}
              </h2>
              <div className="text-[#8899a6] text-sm leading-relaxed space-y-2">
                {body.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-[#c9a84c12] flex flex-wrap gap-6">
          {(["privacy", "cookies", "terms", "safeguarding"] as const)
            .filter((p) => p !== page)
            .map((p) => (
              <button
                key={p}
                onClick={() => {
                  if (onSelectLegalPage) {
                    onSelectLegalPage(p);
                  }
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-[#4a6070] hover:text-[#c9a84c] text-xs underline underline-offset-2 transition-colors capitalize"
              >
                {LEGAL_CONTENT[p]?.title}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
