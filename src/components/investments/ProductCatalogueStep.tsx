import { useState, useEffect, useMemo } from "react";
import { Currency, ResalePlan } from "@/types";
import { XplainProduct, CartItem } from "@/types/product";
import { productService } from "@/services/productService";
import { convert, fmt, minForCurrency, MIN_GHS, MIN_EUR, MIN_GBP, MONTHLY_RATE } from "@/utils/currency";

interface ProductCatalogueStepProps {
  currency: Currency;
  onSelect: (items: CartItem[], option: ResalePlan, amount: number) => void;
  onBack: () => void;
}

export default function ProductCatalogueStep({
  currency,
  onSelect,
  onBack,
}: ProductCatalogueStepProps) {
  const [products, setProducts] = useState<XplainProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [option, setOption] = useState<ResalePlan>("direct");

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [prodList, catList] = await Promise.all([
          productService.getAllProducts(),
          productService.getCategories(),
        ]);
        if (isMounted) {
          setProducts(prodList);
          setCategories(catList);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load products from server");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = catFilter === "All" || p.category.toLowerCase() === catFilter.toLowerCase();
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.ref.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, catFilter, search]);

  const toggleProduct = (product: XplainProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.ref === product.ref);
      if (existing) return prev.filter((i) => i.product.ref !== product.ref);
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (ref: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.product.ref === ref ? { ...i, qty: Math.max(1, qty) } : i
      )
    );
  };

  const removeItem = (ref: string) =>
    setCart((prev) => prev.filter((i) => i.product.ref !== ref));

  const multiplier = option === "direct" ? 1 : 0.86;
  const totalEUR = cart.reduce(
    (s, { product, qty }) => s + product.priceEUR * multiplier * qty,
    0
  );
  const totalInCurrency = convert(totalEUR, "EUR", currency);
  const minAmt = minForCurrency(currency);
  const meetsMin = cart.length > 0 && (totalInCurrency >= minAmt * 0.85 || totalEUR >= 0.85);

  return (
    <div className="min-h-screen bg-[#050c1a] text-[#f0ece0]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#030812] border-b border-[#c9a84c18] nav-blur">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
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
                className="font-display text-sm text-[#e2c97e]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Xplain GH BV
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#4a6070] text-xs hidden sm:block">
              Step 2 of 2 — Choose Products
            </span>
            {cart.length > 0 && (
              <span className="bg-[#c9a84c] text-[#050c1a] text-xs font-bold px-2.5 py-1 rounded-full">
                {cart.length} item{cart.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>
        </div>
        <div className="h-0.5 bg-[#122040]">
          <div className="h-full bg-[#c9a84c] w-full" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1
            className="font-display text-3xl text-[#e2c97e] mb-2"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Xplain
          </h1>
          <p className="text-[#6a7f8a] text-sm">
            Select one or more products to invest in. All prices include shipping
            — duties excluded. Minimum total:{" "}
            <span className="text-[#c9a84c] font-semibold">
              {fmt(MIN_EUR, "EUR")}
            </span>{" "}
            ≈{" "}
            <span className="text-[#c9a84c] font-semibold">
              {fmt(MIN_GBP, "GBP")}
            </span>{" "}
            /{" "}
            <span className="text-[#c9a84c] font-semibold">
              {fmt(MIN_GHS, "GHS")}
            </span>
            .
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Left: product browser */}
          <div>
            <div className="flex gap-3 mb-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products or reference…"
                className="flex-1 bg-[#0c1830] border border-[#c9a84c22] rounded-xl px-4 py-2.5 text-white text-sm input-gold"
              />
            </div>
            <div className="flex gap-2 flex-wrap mb-5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    catFilter === cat
                      ? "bg-[#c9a84c] text-[#050c1a]"
                      : "bg-[#0c1830] border border-[#c9a84c22] text-[#8899a6] hover:text-[#c9a84c]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product grid with images */}
            {loading ? (
              <div className="text-center py-24 text-[#8899a6] text-sm">
                <div className="inline-block w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mb-3" />
                <p>Loading real catalogue from PostgreSQL...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 px-6 bg-[#0c1830] border border-red-500/20 rounded-2xl">
                <p className="text-red-400 text-sm font-semibold mb-2">Unable to load catalogue</p>
                <p className="text-[#4a6070] text-xs mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#c9a84c18] border border-[#c9a84c33] text-[#c9a84c] rounded-xl text-xs font-semibold hover:bg-[#c9a84c30]"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div
                className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pr-1"
                style={{ maxHeight: "calc(100vh - 260px)" }}
              >
                {filtered.map((product) => {
                  const inCart = cart.find((i) => i.product.ref === product.ref);
                  const cartItem = inCart;
                  const unitPrice = convert(product.priceEUR, "EUR", currency);
                  return (
                    <div
                      key={product.ref}
                      className={`rounded-2xl overflow-hidden border transition-all duration-200 ${
                        inCart
                          ? "border-[#c9a84c66] shadow-[0_0_0_2px_rgba(201,168,76,0.25)]"
                          : "border-[#c9a84c12] hover:border-[#c9a84c33]"
                      } bg-[#0c1830]`}
                    >
                      {/* Product image */}
                      <div
                        className="relative overflow-hidden"
                        style={{ height: 140 }}
                      >
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1830] via-[#0c183066] to-transparent" />
                        {inCart && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-[#c9a84c] rounded-full flex items-center justify-center">
                            <span className="text-[#050c1a] text-xs font-bold">
                              ✓
                            </span>
                          </div>
                        )}
                        <span
                          className="absolute bottom-2 left-2 text-[10px] font-mono text-[#c9a84c88] bg-[#030812aa] px-1.5 py-0.5 rounded"
                          style={{ fontFamily: "JetBrains Mono, monospace" }}
                        >
                          {product.ref}
                        </span>
                      </div>

                      <div className="p-4">
                        <p
                          className={`text-sm font-semibold leading-tight mb-3 ${
                            inCart ? "text-[#e2c97e]" : "text-[#d4c8a8]"
                          }`}
                        >
                          {product.name}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p
                              className="font-mono font-bold text-[#e2c97e] text-sm"
                              style={{ fontFamily: "JetBrains Mono, monospace" }}
                            >
                              {fmt(unitPrice, currency)}
                            </p>
                            <p className="text-[#4a6070] text-[10px]">
                              per unit · {currency}
                            </p>
                          </div>
                          {inCart && cartItem && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  updateQty(product.ref, cartItem.qty - 1)
                                }
                                className="w-6 h-6 rounded bg-[#122040] border border-[#c9a84c22] text-[#c9a84c] text-xs font-bold flex items-center justify-center hover:bg-[#1a2e58]"
                              >
                                −
                              </button>
                              <span
                                className="font-mono text-xs text-[#e2c97e] w-5 text-center"
                                style={{
                                  fontFamily: "JetBrains Mono, monospace",
                                }}
                              >
                                {cartItem.qty}
                              </span>
                              <button
                                onClick={() =>
                                  updateQty(product.ref, cartItem.qty + 1)
                                }
                                className="w-6 h-6 rounded bg-[#122040] border border-[#c9a84c22] text-[#c9a84c] text-xs font-bold flex items-center justify-center hover:bg-[#1a2e58]"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>

                        {inCart ? (
                          <button
                            onClick={() => removeItem(product.ref)}
                            className="w-full py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleProduct(product)}
                            className="w-full py-2 rounded-lg bg-[#c9a84c18] border border-[#c9a84c33] text-[#c9a84c] text-xs font-semibold hover:bg-[#c9a84c30] transition-all"
                          >
                            + Add to Selection
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-[#4a6070] text-sm">
                    No products match your search.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: cart + option panel */}
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Choose option */}
            <div className="bg-[#0c1830] border border-[#c9a84c22] rounded-2xl p-5 card-glow">
              <p className="text-[#8899a6] text-xs font-semibold uppercase tracking-wider mb-3">
                Choose Option
              </p>
              <div className="space-y-2">
                {(
                  [
                    {
                      val: "direct" as ResalePlan,
                      label: "Option A — Direct Shipment",
                      sub: "Full listed price · shipped to you",
                    },
                    {
                      val: "sellfor" as ResalePlan,
                      label: "Option B — Sell on Your Behalf",
                      sub: "14% less · Xplain sells for you",
                    },
                  ] as const
                ).map(({ val, label, sub }) => (
                  <button
                    key={val}
                    onClick={() => setOption(val)}
                    className={`w-full text-left rounded-xl px-4 py-3 border transition-all flex items-start gap-3 ${
                      option === val
                        ? "bg-[#c9a84c18] border-[#c9a84c55]"
                        : "bg-[#122040] border-[#c9a84c18] hover:border-[#c9a84c33]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                        option === val
                          ? "border-[#c9a84c] bg-[#c9a84c]"
                          : "border-[#4a6070]"
                      }`}
                    >
                      {option === val && (
                        <div className="w-1.5 h-1.5 bg-[#050c1a] rounded-full" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          option === val ? "text-[#e2c97e]" : "text-[#8899a6]"
                        }`}
                      >
                        {label}
                      </p>
                      <p className="text-[#4a6070] text-xs mt-0.5">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart summary */}
            <div className="bg-[#0c1830] border border-[#c9a84c22] rounded-2xl p-5 card-glow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#8899a6] text-xs font-semibold uppercase tracking-wider">
                  Your Selection
                </p>
                {cart.length > 0 && (
                  <span className="text-[#c9a84c] text-xs font-semibold">
                    {cart.length} product{cart.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <p className="text-[#4a6070] text-sm text-center py-4">
                  No products selected yet. Pick from the catalogue.
                </p>
              ) : (
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {cart.map(({ product, qty }) => {
                    const lineEUR = product.priceEUR * multiplier * qty;
                    const lineAmt = convert(lineEUR, "EUR", currency);
                    return (
                      <div
                        key={product.ref}
                        className="flex items-center gap-3 py-2 border-b border-[#c9a84c0a] last:border-0"
                      >
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[#d4c8a8] text-xs font-semibold truncate">
                            {product.name}
                          </p>
                          <p className="text-[#4a6070] text-xs">
                            {qty} unit{qty !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <p
                          className="font-mono text-xs text-[#e2c97e] font-semibold flex-shrink-0"
                          style={{ fontFamily: "JetBrains Mono, monospace" }}
                        >
                          {fmt(lineAmt, currency)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {cart.length > 0 && (
                <>
                  <div className="gold-line mb-3" />
                  <div className="flex justify-between mb-1">
                    <span className="text-[#c9a84c] text-sm font-semibold">
                      Total Stock Value
                    </span>
                    <span
                      className="font-mono font-bold text-[#e2c97e] text-base"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {fmt(totalInCurrency, currency)}
                    </span>
                  </div>
                  {option === "sellfor" && (
                    <div className="flex justify-between mb-4">
                      <span className="text-[#4a6070] text-xs">
                        Monthly Profit (7%)
                      </span>
                      <span
                        className="font-mono text-xs text-[#c9a84c]"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        {fmt(totalInCurrency * MONTHLY_RATE, currency)}
                      </span>
                    </div>
                  )}
                  {option === "direct" && <div className="mb-4" />}
                  {!meetsMin && (
                    <p className="text-red-400 text-xs mb-3 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                      Minimum is {fmt(minAmt, currency)} ({fmt(MIN_EUR, "EUR")}{" "}
                      equivalent). Add more products or units.
                    </p>
                  )}
                </>
              )}

              <p className="text-[#4a6070] text-xs mb-4">
                ✓ Prices include shipping &nbsp;·&nbsp; Duties not included
              </p>

              <button
                onClick={() => {
                  if (cart.length > 0 && meetsMin)
                    onSelect(cart, option, totalInCurrency);
                }}
                disabled={cart.length === 0 || !meetsMin}
                className="w-full bg-[#c9a84c] text-[#050c1a] font-bold py-3.5 rounded-xl hover:bg-[#e2c97e] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm mb-2"
              >
                {cart.length === 0
                  ? "Select at least one product"
                  : "Continue →"}
              </button>
              <button
                onClick={onBack}
                className="w-full text-[#4a6070] hover:text-[#c9a84c] text-xs py-2 transition-colors flex items-center justify-center gap-1.5"
              >
                ← Back to Account Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
