import { useState } from "react";

interface AddressStepProps {
  partnerName: string;
  onSubmit: (address: string) => void;
  onBack: () => void;
}

export default function AddressStep({
  partnerName,
  onSubmit,
  onBack,
}: AddressStepProps) {
  const [addr, setAddr] = useState({
    fullName: partnerName,
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    country: "",
    phone: "",
  });
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setAddr((a) => ({ ...a, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addr.fullName ||
      !addr.line1 ||
      !addr.city ||
      !addr.postcode ||
      !addr.country
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    const formatted = [
      addr.fullName,
      addr.line1,
      addr.line2,
      `${addr.city} ${addr.postcode}`,
      addr.country,
      addr.phone,
    ]
      .filter(Boolean)
      .join(", ");
    onSubmit(formatted);
  };

  return (
    <div className="min-h-screen bg-[#050c1a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#4a6070] hover:text-[#c9a84c] text-sm mb-8 transition-colors"
        >
          ← Back to Payment
        </button>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-[#c9a84c] rounded-lg flex items-center justify-center">
            <span className="text-[#050c1a] font-bold text-sm">X</span>
          </div>
          <span
            className="font-display text-lg text-[#e2c97e]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Xplain GH BV
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#c9a84c44] border border-[#c9a84c] flex items-center justify-center text-[#c9a84c] text-xs font-bold">
              ✓
            </div>
            <span className="text-[#4a6070] text-xs">Your Details</span>
          </div>
          <div className="flex-1 h-px bg-[#c9a84c22]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#c9a84c44] border border-[#c9a84c] flex items-center justify-center text-[#c9a84c] text-xs font-bold">
              ✓
            </div>
            <span className="text-[#4a6070] text-xs">Choose Product</span>
          </div>
          <div className="flex-1 h-px bg-[#c9a84c22]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#050c1a] text-xs font-bold">
              3
            </div>
            <span className="text-[#c9a84c] text-xs font-semibold">
              Delivery Address
            </span>
          </div>
        </div>

        <h1
          className="font-display text-3xl mb-2"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Delivery Address
        </h1>
        <p className="text-[#4a6070] text-sm mb-8">
          Your product will be shipped directly to this address. All prices include
          shipping — duties are not included.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-8 card-glow space-y-4"
        >
          <div>
            <label className="block text-xs text-[#8899a6] mb-1.5">
              Full Name *
            </label>
            <input
              className="w-full bg-[#122040] border border-[#c9a84c22] rounded-xl px-4 py-3 text-white text-sm input-gold"
              placeholder="Recipient full name"
              value={addr.fullName}
              onChange={(e) => set("fullName", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-[#8899a6] mb-1.5">
              Address Line 1 *
            </label>
            <input
              className="w-full bg-[#122040] border border-[#c9a84c22] rounded-xl px-4 py-3 text-white text-sm input-gold"
              placeholder="Street address, building number"
              value={addr.line1}
              onChange={(e) => set("line1", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-[#8899a6] mb-1.5">
              Address Line 2 <span className="text-[#4a6070]">(optional)</span>
            </label>
            <input
              className="w-full bg-[#122040] border border-[#c9a84c22] rounded-xl px-4 py-3 text-white text-sm input-gold"
              placeholder="Apartment, suite, floor, etc."
              value={addr.line2}
              onChange={(e) => set("line2", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#8899a6] mb-1.5">
                City *
              </label>
              <input
                className="w-full bg-[#122040] border border-[#c9a84c22] rounded-xl px-4 py-3 text-white text-sm input-gold"
                placeholder="City"
                value={addr.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-[#8899a6] mb-1.5">
                Postcode *
              </label>
              <input
                className="w-full bg-[#122040] border border-[#c9a84c22] rounded-xl px-4 py-3 text-white text-sm input-gold"
                placeholder="Postcode / ZIP"
                value={addr.postcode}
                onChange={(e) => set("postcode", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#8899a6] mb-1.5">
              Country *
            </label>
            <input
              className="w-full bg-[#122040] border border-[#c9a84c22] rounded-xl px-4 py-3 text-white text-sm input-gold"
              placeholder="Country"
              value={addr.country}
              onChange={(e) => set("country", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-[#8899a6] mb-1.5">
              Phone Number <span className="text-[#4a6070]">(optional)</span>
            </label>
            <input
              className="w-full bg-[#122040] border border-[#c9a84c22] rounded-xl px-4 py-3 text-white text-sm input-gold"
              placeholder="+233 XX XXX XXXX"
              value={addr.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>

          <div className="bg-[#0a1a35] border border-[#c9a84c18] rounded-xl p-3 text-xs text-[#4a6070]">
            🚚 <span className="text-[#c9a84c] font-semibold">Shipping included</span>{" "}
            in your product price. Import duties and local taxes are the
            responsibility of the recipient.
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-[#c9a84c] text-[#050c1a] font-bold py-3.5 rounded-xl hover:bg-[#e2c97e] transition-all text-sm"
          >
            Confirm & Go to Dashboard →
          </button>
        </form>
      </div>
    </div>
  );
}
