import { useState, useEffect } from "react";

interface NavbarProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function Navbar({ onLogin, onRegister }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 nav-blur transition-all duration-300 ${
        scrolled
          ? "bg-[#050c1aee] border-b border-[#c9a84c22]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
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
        <div className="hidden md:flex items-center gap-8 text-sm text-[#8899a6]">
          <a href="#how" className="hover:text-[#c9a84c] transition-colors">
            How It Works
          </a>
          <a href="#products" className="hover:text-[#c9a84c] transition-colors">
            Products
          </a>
          <a href="#join" className="hover:text-[#c9a84c] transition-colors">
            Invest
          </a>
          <a href="#referral" className="hover:text-[#c9a84c] transition-colors">
            Referral
          </a>
          <a href="#about" className="hover:text-[#c9a84c] transition-colors">
            About
          </a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-sm text-[#c9a84c] hover:text-[#e2c97e] transition-colors px-4 py-2"
          >
            Sign In
          </button>
          <button
            onClick={onRegister}
            className="text-sm bg-[#c9a84c] text-[#050c1a] font-semibold px-5 py-2 rounded-lg hover:bg-[#e2c97e] transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
