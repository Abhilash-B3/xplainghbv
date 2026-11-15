import { LegalDocument } from "@/types";
import { MIN_EUR, MIN_GBP, MIN_GHS } from "@/utils/currency";

export const LEGAL_CONTENT: Record<string, LegalDocument> = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        heading: "1. Who We Are",
        body: 'Xplain GH BV ("we", "us", "our") is a company registered in Jersey Island (3 Route de la Baie, St. Brelade). We operate the Xplain investment platform at xplainghbv.com. For data protection enquiries contact: sales@xplainghbv.com.',
      },
      {
        heading: "2. Data We Collect",
        body: "We collect information you provide when registering (full name, email address, phone number, preferred currency, deposit method, and delivery address for direct-shipment partners). We also collect transactional data (investment amounts, stock-up history, payout records) and technical data (IP address, browser type, device information, and usage logs) to operate and improve the platform.",
      },
      {
        heading: "3. How We Use Your Data",
        body: "Your data is used to: create and manage your partner account; process investments, stock-ups, payouts, and withdrawals; send you statements, confirmations, and service communications; comply with anti-money-laundering (AML) and know-your-customer (KYC) regulations; and improve our platform and user experience.",
      },
      {
        heading: "4. Legal Basis for Processing",
        body: "We process your personal data on the basis of: (a) contract performance — to provide the investment service you signed up for; (b) legal obligation — to comply with financial regulations; and (c) legitimate interests — to prevent fraud and improve our services.",
      },
      {
        heading: "5. Data Sharing",
        body: "We do not sell your personal data. We share it only with: payment processors (MoMo networks, card processors) necessary to complete transactions; logistics partners for direct-shipment deliveries; and regulatory authorities where required by law. All third parties are bound by data-processing agreements.",
      },
      {
        heading: "6. Data Retention",
        body: "We retain your account data for as long as your account is active and for 7 years after closure, as required by financial regulations. Backup data may be held for an additional 12 months.",
      },
      {
        heading: "7. Your Rights",
        body: "Under applicable data protection law you have the right to: access, correct, or delete your personal data; restrict or object to processing; request data portability; and withdraw consent at any time. To exercise these rights, email sales@xplainghbv.com.",
      },
      {
        heading: "8. Security",
        body: "We use industry-standard TLS encryption, access controls, and secure data centres to protect your information. No method of transmission over the internet is 100% secure; we continuously review and improve our security practices.",
      },
      {
        heading: "9. Changes to This Policy",
        body: "We may update this Privacy Policy from time to time. We will notify you of material changes by email or via a prominent notice on the platform at least 14 days before changes take effect.",
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    sections: [
      {
        heading: "1. What Are Cookies?",
        body: "Cookies are small text files placed on your device when you visit our platform. They help us recognise your browser, remember your preferences, and understand how the platform is used.",
      },
      {
        heading: "2. Cookies We Use",
        body: "Essential cookies: Required for the platform to function (session management, security tokens, login state). These cannot be disabled.\n\nPreference cookies: Remember your selected currency, language, and display settings.\n\nAnalytics cookies: Help us understand how partners use the platform (page views, feature usage, error rates). We use privacy-preserving analytics and do not share this data with advertisers.\n\nNo advertising or tracking cookies are used on our platform.",
      },
      {
        heading: "3. Managing Cookies",
        body: "You can control cookies through your browser settings. Disabling essential cookies will prevent you from logging in or using core features. Preference and analytics cookies can be disabled without affecting core functionality.",
      },
      {
        heading: "4. Cookie Lifespan",
        body: "Session cookies are deleted when you close your browser. Preference cookies persist for up to 12 months. Analytics cookies expire after 13 months.",
      },
      {
        heading: "5. Updates",
        body: "We will update this Cookie Policy if we introduce new cookie types. Continued use of the platform after changes constitutes acceptance of the updated policy.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    sections: [
      {
        heading: "1. Acceptance",
        body: "By registering on the Xplain GH BV platform you confirm that you have read, understood, and agree to these Terms of Service. If you do not agree, do not use the platform.",
      },
      {
        heading: "2. Eligibility",
        body: "You must be at least 18 years old to register. By signing up you confirm that all information provided is accurate and that you are not subject to sanctions or restrictions that would prohibit participation in our investment programme.",
      },
      {
        heading: "3. Resale Plans",
        body: "Option A — Direct Shipment: You pay the full listed price (including shipping, excluding duties). Products are shipped to your nominated delivery address. No monthly profit applies to direct-shipment orders.\n\nOption B — Sell on Behalf: You pay 14% less than the listed price. Xplain sells the products on your behalf and pays you 7% of your stocked capital each month for as long as you remain an active partner.",
      },
      {
        heading: "4. Returns & Payouts",
        body: "The 7% monthly profit applies to Option B partners only. Returns are calculated on each investment batch separately. The first payout for each batch is due 30 days after the investment date and monthly thereafter. Xplain does not guarantee future returns; the 7% rate reflects current trading margins and may be reviewed with 30 days' notice.",
      },
      {
        heading: "5. Minimum Stock Value",
        body: `The minimum investment is €${MIN_EUR.toFixed(2)} (approximately £${MIN_GBP.toFixed(2)} / GH₵${MIN_GHS.toFixed(2)}) or the equivalent in your preferred currency at the time of investment.`,
      },
      {
        heading: "6. Add Stocks",
        body: "Option B partners may add additional investment batches at any time. Each stock-up is treated as a separate batch with its own 30-day start date and 7% monthly profit schedule.",
      },
      {
        heading: "7. Capital Withdrawal",
        body: "Invested capital is locked for a minimum of 12 months per batch from the date of investment. Monthly returns (7%) may be withdrawn at any time after they are earned. Unlocked capital may be withdrawn upon written request to sales@xplainghbv.com.",
      },
      {
        heading: "8. Referral Programme",
        body: "Registered partners receive a unique referral link. When a referred partner remains active, the referrer earns 3% of the referred partner's capital each month, paid at the end of each calendar month. Referral bonuses are not guaranteed and may be discontinued with 30 days' notice.",
      },
      {
        heading: "9. Fees",
        body: "There are no platform fees for joining, investing, or withdrawing returns. Xplain earns its margin through product resale. Payment processor fees (MoMo or card) are borne by the partner at the prevailing network rate.",
      },
      {
        heading: "10. Termination",
        body: "You may close your account at any time by contacting sales@xplainghbv.com. Unlocked capital and outstanding returns will be paid within 14 business days of account closure. Locked capital remains locked until the applicable 12-month period expires.",
      },
      {
        heading: "11. Limitation of Liability",
        body: "To the maximum extent permitted by law, Xplain GH BV shall not be liable for indirect, incidental, or consequential losses. Our aggregate liability is limited to the amount you have invested with us in the 12 months preceding the claim.",
      },
      {
        heading: "12. Governing Law",
        body: "These Terms are governed by the laws of Jersey Island. Any disputes shall be subject to the exclusive jurisdiction of the courts of Jersey Island.",
      },
    ],
  },
  safeguarding: {
    title: "Safeguarding Policy",
    sections: [
      {
        heading: "Our Commitment",
        body: "Xplain GH BV is committed to protecting all individuals who interact with our platform from harm, exploitation, and abuse. We take safeguarding seriously and have put in place procedures to identify, report, and respond to any concerns.",
      },
      {
        heading: "Scope",
        body: "This policy applies to all partners, staff, contractors, and third parties associated with Xplain GH BV. It covers interactions on our platform, during support communications, and in any business relationship with our company.",
      },
      {
        heading: "Preventing Financial Exploitation",
        body: "We take steps to prevent financial exploitation and investment fraud, including:\n• Identity verification during registration to confirm partner identity.\n• Clear, honest communication about investment terms, risks, and returns.\n• No pressure selling — partners may take as much time as they need before committing.\n• A 14-day cooling-off period for new partners who wish to cancel their investment and receive a full refund (before products are shipped or allocated).",
      },
      {
        heading: "Reporting Concerns",
        body: "If you believe you or someone else may be at risk of harm, exploitation, or financial abuse in connection with our platform, please report it immediately to:\nsafeguarding@xplainghbv.com\n\nAll reports are treated in strict confidence.",
      },
      {
        heading: "Anti-Money Laundering (AML)",
        body: "Xplain GH BV complies with applicable AML regulations. We may request proof of identity and source of funds for investments above regulatory thresholds. All suspicious transactions are reported to the relevant authorities.",
      },
      {
        heading: "Staff Training",
        body: "All Xplain staff involved in partner relations receive safeguarding awareness training. We review and update this policy annually or following any safeguarding incident.",
      },
      {
        heading: "Review",
        body: "This Safeguarding Policy was last reviewed in September 2026 and will be reviewed annually.",
      },
    ],
  },
};
