import { useState, useEffect } from "react";
import { View } from "@/types";
import { ApplianceShowcase } from "@/types/product";
import { productService } from "@/services/productService";
import { fmt, convert, MIN_GHS, MIN_EUR, MIN_GBP } from "@/utils/currency";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Calculator from "@/components/calculator/Calculator";

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
  onLegal: (view: View) => void;
}

export default function LandingPage({
  onLogin,
  onRegister,
  onLegal,
}: LandingPageProps) {
  const [showcases, setShowcases] = useState<ApplianceShowcase[]>([]);

  useEffect(() => {
    productService.getShowcaseAppliances()
      .then((data) => setShowcases(data))
      .catch((err) => console.error("Failed to load showcase appliances:", err));
  }, []);
  return (
    <div className="min-h-screen bg-[#050c1a] text-[#f0ece0]">
      {/* NAV */}
      <Navbar onLogin={onLogin} onRegister={onRegister} />

      {/* HERO */}
      <section className="relative hero-gradient min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1761437856376-2ce1c483343b?w=1400&h=900&fit=crop&auto=format)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050c1a00] via-[#050c1a44] to-[#050c1a]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#c9a84c18] border border-[#c9a84c44] rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-[#c9a84c] rounded-full animate-pulse" />
              <span className="text-[#c9a84c] text-xs font-semibold tracking-widest uppercase">
                Active Investment Platform
              </span>
            </div>
            <h1
              className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              Invest in{" "}
              <em className="text-gold-gradient not-italic">
                Home Appliances.
              </em>{" "}
              <br />
              Earn <span className="text-gold-gradient">7%</span> Monthly.
            </h1>
            <p className="text-[#8899a6] text-lg leading-relaxed mb-10 max-w-lg">
              Xplain GH BV operates a premium home appliance reselling business
              across Europe. Stock any amount and receive 7% monthly profit on
              profit returns — paid in Euro, Pound, or Cedi.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onRegister}
                className="bg-[#c9a84c] text-[#050c1a] font-semibold px-8 py-4 rounded-xl hover:bg-[#e2c97e] transition-all hover:shadow-[0_0_32px_rgba(201,168,76,0.3)] text-base"
              >
                Sign Up
              </button>
              <button
                onClick={onLogin}
                className="border border-[#c9a84c44] text-[#c9a84c] font-semibold px-8 py-4 rounded-xl hover:border-[#c9a84c] transition-all text-base"
              >
                Sign In
              </button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6">
              {[
                ["7%", "Monthly Profit"],
                ["3%", "Referral Bonus"],
                ["Visa & Card", "Instant Deposit"],
              ].map(([val, label]) => (
                <div key={label}>
                  <p
                    className="font-mono font-semibold text-[#e2c97e] text-xl"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {val}
                  </p>
                  <p className="text-[#4a6070] text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1772567732902-2d239d957f29?w=700&h=520&fit=crop&auto=format"
                alt="Modern kitchen with premium stainless steel appliances"
                className="rounded-2xl w-full object-cover"
                style={{ height: 480 }}
              />
              <div className="absolute -bottom-6 -left-6 bg-[#0c1830] border border-[#c9a84c33] rounded-2xl p-5 card-glow">
                <p className="text-[#8899a6] text-xs mb-1">Monthly Payout</p>
                <p
                  className="font-mono font-bold text-[#e2c97e] text-2xl"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {fmt(2500 * 0.07, "EUR")}
                </p>
                <p className="text-[#c9a84c] text-xs mt-1">
                  on {fmt(2500, "EUR")} stocked
                </p>
              </div>
              <div className="absolute -top-4 -right-4 bg-[#c9a84c] text-[#050c1a] rounded-2xl px-5 py-3 shadow-lg">
                <p className="text-xs font-semibold">Monthly Interest</p>
                <p
                  className="font-mono font-bold text-2xl"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  7%
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="bg-[#0c1830] border-y border-[#c9a84c18]">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ["7%", "Monthly Interest Rate"],
            ["3%", "Referral Bonus"],
            ["€ £ GH₵", "Supported Currencies"],
            ["500+", "Active Partners"],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <p
                className="font-mono font-bold text-[#e2c97e] text-2xl"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {val}
              </p>
              <p className="text-[#4a6070] text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#c9a84c] text-xs font-semibold tracking-widest uppercase mb-3">
            Simple Process
          </p>
          <h2
            className="font-display text-4xl md:text-5xl"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            How It Works
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Register & Choose Product",
              desc: "Create your account, browse Xplain appliances, pick your product and resale plan — then fund securely with your Visa or major card via Stripe.",
              icon: "💳",
            },
            {
              step: "02",
              title: "We Resell Appliances",
              desc: "Your capital is deployed into our home appliances reselling operations — refrigerators, washers, kitchens, and electronics.",
              icon: "🏪",
            },
            {
              step: "03",
              title: "Collect Monthly Profits",
              desc: "Receive 7% monthly profit on your stock value, paid to your MoMo wallet or bank account in your preferred currency.",
              icon: "📈",
            },
          ].map(({ step, title, desc, icon }) => (
            <div
              key={step}
              className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-8 card-glow relative overflow-hidden group transition-all duration-300 card-glow-hover"
            >
              <div
                className="absolute top-4 right-6 font-mono font-bold text-6xl text-[#c9a84c0a] group-hover:text-[#c9a84c14] transition-colors"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {step}
              </div>
              <div className="text-4xl mb-5">{icon}</div>
              <h3
                className="font-display text-xl text-[#e2c97e] mb-3"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                {title}
              </h3>
              <p className="text-[#6a7f8a] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* APPLIANCES */}
      <section id="products" className="py-24 bg-[#030812]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#c9a84c] text-xs font-semibold tracking-widest uppercase mb-3">
              What We Trade
            </p>
            <h2
              className="font-display text-4xl md:text-5xl"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              Premium Home Appliances
            </h2>
            <p className="text-[#6a7f8a] mt-4 max-w-xl mx-auto">
              We source and resell high-demand household appliances across
              Europe, generating consistent margins that fund your returns.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {showcases.map(({ id, name, desc, img, tag }) => (
              <div
                key={id || name}
                className="rounded-2xl overflow-hidden bg-[#0c1830] border border-[#c9a84c18] card-glow group cursor-pointer transition-all duration-300 card-glow-hover"
              >
                <div
                  className="relative overflow-hidden"
                  style={{ height: 220 }}
                >
                  <img
                    src={img}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1830] via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 bg-[#c9a84c] text-[#050c1a] text-xs font-bold px-3 py-1 rounded-full">
                    {tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3
                    className="font-display text-lg text-[#e2c97e] mb-2"
                    style={{ fontFamily: "Fraunces, Georgia, serif" }}
                  >
                    {name}
                  </h3>
                  <p className="text-[#6a7f8a] text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INVEST / CALCULATOR */}
      <section id="join" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#c9a84c] text-xs font-semibold tracking-widest uppercase mb-3">
              Get Started
            </p>
            <h2
              className="font-display text-4xl md:text-5xl mb-6"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              Calculate Your Returns
            </h2>
            <p className="text-[#6a7f8a] mb-8 leading-relaxed">
              Minimum investment is {fmt(MIN_EUR, "EUR")} (≈ {fmt(MIN_GBP, "GBP")}{" "}
              / {fmt(MIN_GHS, "GHS")}). The 7% monthly profit rate applies
              equally to all currencies and both resale plans.
            </p>
            <div className="space-y-4">
              {[
                {
                  method: "Visa / Mastercard / Major Cards",
                  desc: "Instant card deposit powered securely by Stripe",
                  icon: "💳",
                },
                {
                  method: "3D Secure & SCA Protection",
                  desc: "Bank-level cardholder authentication and fraud prevention",
                  icon: "🔒",
                },
              ].map(({ method, desc, icon }) => (
                <div
                  key={method}
                  className="flex items-center gap-4 bg-[#0c1830] border border-[#c9a84c18] rounded-xl p-4"
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-[#e2c97e] font-semibold text-sm">
                      {method}
                    </p>
                    <p className="text-[#4a6070] text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Calculator />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0c1830] border-y border-[#c9a84c18]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2
            className="font-display text-4xl md:text-5xl mb-6 text-gold-gradient"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Ready to Start Earning?
          </h2>
          <p className="text-[#6a7f8a] mb-10 text-lg">
            Join hundreds of resale partners earning 7% monthly profit through
            our home appliance reselling business.
          </p>
          <button
            onClick={onRegister}
            className="bg-[#c9a84c] text-[#050c1a] font-bold px-12 py-5 rounded-xl text-lg hover:bg-[#e2c97e] transition-all hover:shadow-[0_0_48px_rgba(201,168,76,0.35)]"
          >
            Become a Partner
          </button>
        </div>
      </section>

      {/* REFERRAL */}
      <section id="referral" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[#c9a84c] text-xs font-semibold tracking-widest uppercase mb-3">
            Earn More Together
          </p>
          <h2
            className="font-display text-4xl md:text-5xl mb-4"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Referral Bonus Programme
          </h2>
          <p className="text-[#6a7f8a] max-w-xl mx-auto">
            As an existing partner, every person you refer who opens an account
            and stays active earns you{" "}
            <span className="text-[#c9a84c] font-semibold">3% monthly</span> of
            their stocked capital —{" "}
            <span className="text-[#e2c97e] font-semibold">
              paid at the end of each month
            </span>
            , for as long as they partner with us.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {[
            {
              step: "01",
              icon: "🔗",
              title: "Share Your Link",
              desc: "After registering, you receive a unique referral code and link to share with friends, family, or your network.",
            },
            {
              step: "02",
              icon: "👤",
              title: "They Join",
              desc: "When someone signs up using your link and makes their initial deposit, the referral is confirmed automatically.",
            },
            {
              step: "03",
              icon: "💸",
              title: "You Earn 3% Monthly",
              desc: "Every month your referee stays active, you earn 3% of their stocked capital — paid to you at the end of each month. No cap.",
            },
          ].map(({ step, icon, title, desc }) => (
            <div
              key={step}
              className="bg-[#0c1830] border border-[#c9a84c18] rounded-2xl p-8 card-glow relative overflow-hidden group transition-all duration-300 card-glow-hover"
            >
              <div
                className="absolute top-4 right-6 font-mono font-bold text-6xl text-[#c9a84c0a] group-hover:text-[#c9a84c14] transition-colors"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {step}
              </div>
              <div className="text-4xl mb-5">{icon}</div>
              <h3
                className="font-display text-xl text-[#e2c97e] mb-3"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                {title}
              </h3>
              <p className="text-[#6a7f8a] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#0c1830] border border-[#c9a84c22] rounded-2xl p-8 card-glow">
          <h3
            className="font-display text-xl text-[#e2c97e] mb-6 text-center"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Example Referral Earnings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#c9a84c12]">
                  <th className="text-left text-xs text-[#4a6070] font-semibold pb-4">
                    Referral&apos;s Investment
                  </th>
                  <th className="text-left text-xs text-[#4a6070] font-semibold pb-4">
                    EUR
                  </th>
                  <th className="text-left text-xs text-[#4a6070] font-semibold pb-4">
                    GBP
                  </th>
                  <th className="text-left text-xs text-[#4a6070] font-semibold pb-4">
                    GHS
                  </th>
                </tr>
              </thead>
              <tbody>
                {[500, 1000, 5000, 10000].map((capitalEUR) => {
                  const bonus3pct = capitalEUR * 0.03;
                  return (
                    <tr
                      key={capitalEUR}
                      className="border-b border-[#c9a84c08] table-row-hover"
                    >
                      <td className="py-3.5 text-sm text-[#d4c8a8] font-semibold">
                        {fmt(capitalEUR, "EUR")} stocked
                      </td>
                      <td
                        className="py-3.5 font-mono text-sm text-[#e2c97e]"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        {fmt(bonus3pct, "EUR")}
                      </td>
                      <td
                        className="py-3.5 font-mono text-sm text-[#e2c97e]"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        {fmt(convert(bonus3pct, "EUR", "GBP"), "GBP")}
                      </td>
                      <td
                        className="py-3.5 font-mono text-sm text-[#e2c97e]"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        {fmt(convert(bonus3pct, "EUR", "GHS"), "GHS")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[#4a6070] text-xs mt-5 text-center">
            3% of your referee&apos;s capital is paid monthly at the end of each
            calendar month. No cap, no limit.
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1778731525496-3e7bd4807e55?w=700&h=480&fit=crop&auto=format"
              alt="Modern stainless steel kitchen appliances"
              className="rounded-2xl w-full object-cover"
              style={{ height: 400 }}
            />
          </div>
          <div>
            <p className="text-[#c9a84c] text-xs font-semibold tracking-widest uppercase mb-3">
              About the Company
            </p>
            <h2
              className="font-display text-4xl mb-6"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              Xplain GH BV
            </h2>
            <p className="text-[#6a7f8a] mb-4 leading-relaxed">
              We are a Jersey Island-based home appliances reselling company
              with an active trading presence across Europe and globally. We
              source premium household appliances — refrigerators, washing
              machines, kitchen suites, and electronics — and distribute them
              through established retail and wholesale channels worldwide.
            </p>
            <p className="text-[#6a7f8a] mb-6 leading-relaxed">
              Our consistent trade margins fund predictable 7% monthly profit
              for every partner, regardless of currency or investment size.
            </p>
            <div className="space-y-3 text-sm text-[#6a7f8a]">
              <div className="flex items-start gap-3">
                <span className="text-[#c9a84c] mt-0.5">📍</span>
                <span>3 Route de la Baie, St. Brelade, Jersey Island</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#c9a84c] mt-0.5">✉️</span>
                <span>sales@xplainghbv.com</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#c9a84c] mt-0.5">🌍</span>
                <span>Operating across Europe and globally</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer onLegal={onLegal} />
    </div>
  );
}
