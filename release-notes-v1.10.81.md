# Free GST Billing Software — v1.10.81 (Enterprise Desktop Release)

### 🚀 Major Architecture & Desktop Revamp by OM RAJ
**100% Free, Zero-Subscription, Privacy-First GST Invoicing & Accounting Software**

---

### 📦 Direct Desktop Downloads

| Platform | Installer File | Architecture | Download Link |
| :--- | :--- | :---: | :---: |
| 🍏 **macOS** | `Free.GST.Billing.Software-1.10.81-arm64.dmg` | Apple Silicon (M1/M2/M3/M4) | [⬇ Download macOS DMG](https://github.com/OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-/releases/download/v1.10.81/Free.GST.Billing.Software-1.10.81-arm64.dmg) |
| 🪟 **Windows** | `Free.GST.Billing.Software.Setup.1.10.81.exe` | Windows 10 / 11 (x64 & arm64) | [⬇ Download Windows Setup](https://github.com/OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-/releases/download/v1.10.81/Free.GST.Billing.Software.Setup.1.10.81.exe) |

*(Both installers include the bundled offline Express engine and full client frontend with zero external dependencies).*

---

### 🛡️ Enterprise Security Hardening & REA Audit
- **Anti-DNS Rebinding Protection:** The local server validates incoming HTTP `Host` headers against a strict local loopback whitelist (`localhost`, `127.0.0.1`, `[::1]`) across all Express routes, preventing external browser cross-origin pivot attacks.
- **Prototype Pollution Prevention:** Implemented key sanitization on all metadata and configuration endpoints (`/api/meta/:key`), preventing `__proto__`, `constructor`, and `prototype` injection.
- **PIN Session Protection:** Scrypt-based password derivation (`crypto.scryptSync(pin, salt, 32)`) generates transient cryptographic session tokens upon PIN unlock, enforcing `X-App-Token` authentication for sensitive accounting data with instant revocation on lock.
- **Electron Sandbox Isolation:** Enforces `contextIsolation: true`, `nodeIntegration: false`, and strict preload IPC boundaries.

---

### 📊 Core Indian GST & Accounting Engine
- **356 / 356 Automated Unit Tests Passing:** Verified 100% test pass rate across CGST, SGST, IGST, UTGST, RCM, TCS/TDS, and Section 234 interest calculations.
- **Union Territory Support (UTGST):** Intra-UT supplies for Chandigarh, Ladakh, Andaman & Nicobar, Lakshadweep, and Dadra & Nagar Haveli / Daman & Diu properly file as CGST + UTGST.
- **Section 206C(1H) TCS Tracking:** Enforces the ₹50 Lakh annual per-counterparty threshold on receipts including GST (CBDT Circular 17/2020).
- **Budget 2025-26 Tax Alignment:** Integrates the latest FY 25-26 income tax slabs, Section 87A rebate thresholds, and revised capital gains rules (STCG 20%, LTCG 12.5%, ₹1.25 Lakh exemption).
- **Government Portal JSON Exports:** One-click official schema generation for **GSTR-1**, **GSTR-3B**, and **GSTR-2B purchase reconciliation**.

---

### 💳 Payments & Visual Styling
- **Updated Clean Square UPI QR:** Directly embedded clean, high-resolution square UPI QR code (`support-qr.jpeg`) for zero-fee payments across all major UPI apps (GPay, PhonePe, Paytm, BHIM, SBI).
- **Privacy-First Support Section:** Removed raw UPI text display, ensuring clean visual presentation and frictionless scanning.
- **Modern Glassmorphic Interface:** Translucent frosted panels, crisp borders, responsive layout grids, and keyboard-first POS navigation (Ctrl+K Command Palette).
- **100% Offline Local Storage:** Invoices, client records, and accounts reside strictly on your local disk (`data/`).

---

### 🔗 Project Links & Documentation
- **GitHub Repository:** [OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-](https://github.com/OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-)
- **Maintainer:** [OM RAJ (@OmRaj6666)](https://github.com/OmRaj6666)
- **LinkedIn Profile:** [om-raj-vit](https://www.linkedin.com/in/om-raj-vit/)
- **Contact Email:** [omraj6666@gmail.com](mailto:omraj6666@gmail.com)
