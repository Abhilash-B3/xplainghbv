import { useState } from "react";
import { Currency, PaymentMethod, ResalePlan, PartnerProfile } from "@/types";
import { XplainProduct, CartItem } from "@/types/product";
import { SYMBOLS, convert } from "@/utils/currency";
import { useAuth } from "@/context/AuthContext";
import { investmentService } from "@/services/investmentService";
import ProductCatalogueStep from "@/components/investments/ProductCatalogueStep";
import AddressStep from "@/components/forms/AddressStep";
import PaymentStep from "@/components/payments/PaymentStep";

interface AuthFormProps {
  mode: "login" | "register";
  onSuccess: (partner: PartnerProfile) => void;
  onSwitch: () => void;
  onBack: () => void;
}

export default function AuthForm({
  mode,
  onSuccess,
  onSwitch,
  onBack,
}: AuthFormProps) {
  const { login, register, partner } = useAuth();
  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4>(1);
  const [pendingProfile, setPendingProfile] = useState<PartnerProfile | null>(null);
  const [createdInvestmentId, setCreatedInvestmentId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    currency: "EUR" as Currency,
    stockValue: "",
    paymentMethod: "visa" as PaymentMethod,
    password: "",
    selectedProduct: undefined as XplainProduct | undefined,
    resalePlan: "direct" as ResalePlan,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  // Step 1: User details → Register with backend
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        phone: form.phone,
        fullName: form.name,
        preferredCurrency: form.currency,
        resalePlan: form.resalePlan.toUpperCase() as any,
      });
      setRegStep(2);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Product catalogue selection → create investment intent & go to payment
  const handleProductSelect = async (
    items: CartItem[],
    option: ResalePlan,
    amount: number
  ) => {
    const productNames = items
      .map(({ product, qty }) => `${qty}× ${product.name}`)
      .join(" | ");
    const today = new Date().toISOString().split("T")[0];
    const amountEUR = convert(amount, form.currency, "EUR");

    setLoading(true);
    setError("");

    try {
      const planEnum = option === "direct" ? "DIRECT" : "SELLFOR";
      const quoteItems = items.map((i) => ({
        productId: i.product.id || '',
        quantity: i.qty,
      }));

      // Create authoritative investment intent in PostgreSQL
      const invRes = await investmentService.createInvestment({
        resalePlan: planEnum as any,
        currency: form.currency,
        items: quoteItems,
      });

      const invId = invRes.investment?.id || (invRes as any)?.id;
      setCreatedInvestmentId(invId);

      const profile: PartnerProfile = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        currency: form.currency,
        stockValue: amount,
        paymentMethod: "visa",
        startDate: today,
        selectedProduct: productNames,
        resalePlan: option,
        referralCode: partner?.referralCode || "",
        batches: [
          {
            id: invId || `t${Date.now()}`,
            amountEUR,
            orderedAt: today,
            method: "visa",
          },
        ],
      };
      setPendingProfile(profile);
      setRegStep(3); // → Payment
    } catch (err: any) {
      setError(err.message || "Failed to create investment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Payment confirmed → address (Option A) or dashboard (Option B)
  const handlePaymentSuccess = (method: PaymentMethod) => {
    if (!pendingProfile) return;
    const paid = {
      ...pendingProfile,
      paymentMethod: method,
      batches: pendingProfile.batches.map((t) => ({ ...t, method })),
    };
    setPendingProfile(paid);
    if (paid.resalePlan === "direct") {
      setRegStep(4); // → Delivery address
    } else {
      onSuccess(paid);
    }
  };

  // Address submitted → dashboard
  const handleAddressSubmit = (address: string) => {
    if (!pendingProfile) return;
    onSuccess({ ...pendingProfile, deliveryAddress: address });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login({ email: form.email, password: form.password });
      if (partner) {
        onSuccess(partner);
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: delivery address (Option A only, after payment)
  if (mode === "register" && regStep === 4) {
    return (
      <AddressStep
        partnerName={form.name}
        onSubmit={handleAddressSubmit}
        onBack={() => setRegStep(3)}
      />
    );
  }

  // Step 3: payment
  if (mode === "register" && regStep === 3 && pendingProfile) {
    return (
      <PaymentStep
        investmentId={createdInvestmentId || undefined}
        amount={pendingProfile.stockValue}
        currency={pendingProfile.currency}
        partnerName={pendingProfile.name}
        defaultMethod="visa"
        onSuccess={handlePaymentSuccess}
        onBack={() => setRegStep(2)}
      />
    );
  }

  // Step 2: product catalogue
  if (mode === "register" && regStep === 2) {
    return (
      <ProductCatalogueStep
        currency={form.currency}
        onSelect={(items, option, amount) =>
          handleProductSelect(items, option, amount)
        }
        onBack={() => setRegStep(1)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050c1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a1628] border border-[#1a3055] rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="text-xs text-[#8899a6] hover:text-[#c9a84c] transition-colors"
          >
            ← Back
          </button>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#122040] text-[#c9a84c] border border-[#c9a84c]/20">
            {mode === "login" ? "Partner Login" : "Partner Application"}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          {mode === "login" ? "Welcome Back" : "Become a Partner"}
        </h2>
        <p className="text-xs text-[#8899a6] mb-8">
          {mode === "login"
            ? "Enter your credentials to access your partner dashboard"
            : "Complete the form below to start your appliance investment journey"}
        </p>

        <form
          onSubmit={mode === "login" ? handleLoginSubmit : handleStep1}
          className="space-y-4"
        >
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-[#8899a6] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Kwame Mensah"
                className="w-full bg-[#050c1a] border border-[#1a3055] rounded-xl px-4 py-3 text-sm text-white placeholder-[#3a5070] focus:border-[#c9a84c] focus:outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8899a6] mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#050c1a] border border-[#1a3055] rounded-xl px-4 py-3 text-sm text-white placeholder-[#3a5070] focus:border-[#c9a84c] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8899a6] mb-1.5">
              Password *
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder={mode === "register" ? "Min 8 chars, 1 uppercase, 1 number" : "••••••••"}
              className="w-full bg-[#050c1a] border border-[#1a3055] rounded-xl px-4 py-3 text-sm text-white placeholder-[#3a5070] focus:border-[#c9a84c] focus:outline-none transition-colors"
            />
          </div>

          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#8899a6] mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full bg-[#050c1a] border border-[#1a3055] rounded-xl px-4 py-3 text-sm text-white placeholder-[#3a5070] focus:border-[#c9a84c] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8899a6] mb-1.5">
                  Preferred Currency
                </label>
                <div className="flex gap-2">
                  {(["EUR", "GBP", "GHS"] as Currency[]).map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => set("currency", c)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        form.currency === c
                          ? "bg-[#c9a84c] text-[#050c1a]"
                          : "bg-[#122040] text-[#8899a6] hover:text-[#c9a84c]"
                      }`}
                    >
                      {SYMBOLS[c]} {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8899a6] mb-1.5">
                  Payment Method
                </label>
                <div className="flex items-center justify-between rounded-xl border border-[#c9a84c22] bg-[#122040] px-4 py-3 text-xs text-[#e2c97e]">
                  <span className="flex items-center gap-2 font-semibold">
                    <span>💳</span>
                    <span>Debit / Credit Card (Visa & Major Cards)</span>
                  </span>
                  <span className="rounded-md bg-[#c9a84c22] px-2 py-0.5 font-mono text-[10px] text-[#c9a84c]">
                    Stripe Secure
                  </span>
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c9a84c] text-[#050c1a] font-bold py-3.5 rounded-xl hover:bg-[#e2c97e] transition-all disabled:opacity-60 text-sm"
          >
            {loading
              ? "Please wait…"
              : mode === "login"
              ? "Sign In"
              : "Next — Choose Product →"}
          </button>

          <p className="text-center text-xs text-[#4a6070]">
            {mode === "login" ? "No account?" : "Already registered?"}{" "}
            <button
              type="button"
              onClick={onSwitch}
              className="text-[#c9a84c] hover:text-[#e2c97e]"
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
