import { useState, useEffect } from "react";
import { View, PartnerProfile } from "@/types";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import LegalPage from "@/pages/LegalPage";
import ProductCatalogueStep from "@/components/investments/ProductCatalogueStep";

function AppContent() {
  const { partner, isAuthenticated, logout, updatePartnerProfile } = useAuth();
  const [view, setView] = useState<View>("landing");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  useEffect(() => {
    if (isAuthenticated && partner && view === "login") {
      setView("dashboard");
    }
  }, [isAuthenticated, partner, view]);

  const handleAuthSuccess = (_profile: PartnerProfile) => {
    setView("dashboard");
  };

  const handleLogout = async () => {
    await logout();
    setView("landing");
  };

  const handleUpdatePartner = async (updated: PartnerProfile) => {
    await updatePartnerProfile(updated);
  };

  // Option B partner edits their product selection from the dashboard
  if (view === "edit-products" && partner) {
    return (
      <ProductCatalogueStep
        currency={partner.currency}
        onSelect={async (items, option, amount) => {
          const productNames = items
            .map(({ product, qty }) => `${qty}× ${product.name}`)
            .join(" | ");
          await updatePartnerProfile({
            resalePlan: option,
            selectedProduct: productNames,
            stockValue: amount,
          });
          setView("dashboard");
        }}
        onBack={() => setView("dashboard")}
      />
    );
  }

  if (view === "dashboard" && partner) {
    return (
      <DashboardPage
        partner={partner}
        onUpdatePartner={handleUpdatePartner}
        onBack={() =>
          partner.resalePlan === "sellfor"
            ? setView("edit-products")
            : setView("landing")
        }
        onLogout={handleLogout}
      />
    );
  }

  if (
    view === "privacy" ||
    view === "cookies" ||
    view === "terms" ||
    view === "safeguarding"
  ) {
    return (
      <LegalPage
        page={view}
        onBack={() => setView("landing")}
        onSelectLegalPage={(p) => setView(p as View)}
      />
    );
  }

  if (view === "login" || view === "register") {
    return (
      <AuthPage
        mode={view}
        onSuccess={handleAuthSuccess}
        onSwitch={() => setView(view === "login" ? "register" : "login")}
        onBack={() => setView("landing")}
      />
    );
  }

  return (
    <LandingPage
      onLogin={() => setView("login")}
      onRegister={() => setView("register")}
      onLegal={(v) => setView(v)}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
