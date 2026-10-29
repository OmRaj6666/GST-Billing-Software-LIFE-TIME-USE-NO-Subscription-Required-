# Changelog

All notable changes to **Free GST Billing Software** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.10.81] - 2026-10-29

**Major architecture revamp by OM RAJ: Enterprise-grade security hardening, native macOS & Windows desktop builds (.dmg and .exe), direct UPI & custom QR payments, modern glassmorphic interface, and verified offline GST computation engine.**

### Security & Hardening
- **Anti-DNS Rebinding Protection:** Server verifies HTTP Host header against strict local loopback whitelist (localhost, 127.0.0.1, [::1]) on all private Express routes, mitigating external cross-origin browser pivot attacks.
- **Prototype Pollution Prevention:** Added rigorous key filtering on configuration and metadata persistence APIs (/api/meta/:key), explicitly rejecting dangerous keys like __proto__, constructor, and prototype.
- **PIN Session Protection:** Scrypt-based password derivation engine generates transient cryptographic session tokens on PIN unlock. Sensitive business data, clients, and accounting routes enforce X-App-Token verification with automatic token revocation on lock.

### Desktop Packaging
- **Native macOS Application:** Built Apple Silicon (.dmg, arm64) DMG installer with zero-dependency standalone bundling and native menu bar integration.
- **Native Windows Application:** Built Windows Setup (.exe) installer with automated NSIS installer workflow, background Express daemon supervision, and desktop shortcuts.
- **Electron Security Sandbox:** Native process sandboxing with contextIsolation: true, nodeIntegration: false, and strict preload IPC boundaries.

### Payments & Support
- **Direct UPI Integration:** Direct zero-fee instant UPI transfer integration to 9279126895@ptsbi with real-time payment link generation and automated transaction remarks.
- **Verified QR Scanner:** Embedded high-resolution dynamic QR code renderer for seamless UPI payments across all major UPI apps (GPay, PhonePe, Paytm, BHIM, SBI).
- **Direct Developer Support:** Built-in direct enquiry and developer support channel via omraj6666@gmail.com.

### User Interface & Modern Styling
- **Glassmorphism Visual Polish:** Modern layered translucent panels, crisp borders, subtle backdrop filters, and improved typography.
- **Interactive Micro-Interactions:** Modern gradient accents for primary action buttons, polished focus rings, responsive mobile layouts, and instant feedback notifications.
- **Streamlined Workflow:** Redesigned Support & About section with single-version release inspection and direct GitHub issue links.

### Core GST & Accounting Engine
- **Full Tax Suite Verification:** Verified 100% test pass rate across 356 automated test suites covering CGST, SGST, IGST, UTGST, RCM, TCS/TDS, and Section 234 interest calculations.
- **Budget 2025-26 Alignment:** Integrated latest FY 25-26 tax slabs, capital gains rules (STCG 20%, LTCG 12.5%), and Section 87A rebate logic.
- **Local-First Privacy:** All invoices, clients, inventory, and ledger databases remain 100% on the user's local machine with complete offline autonomy.
