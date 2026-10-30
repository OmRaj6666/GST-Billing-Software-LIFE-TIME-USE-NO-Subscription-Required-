# Changelog

All notable changes to **Free GST Billing Software** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.10.82] - 2026-10-30

**Desktop release stability fix: Fix blank screen on macOS (.dmg) and Windows (.exe), correct Windows x64 processor architecture, redirect data storage to standard OS user application directory, and update application icons.**

### Desktop Fixes (.dmg & .exe)
- **Resolved Blank Screen & Startup Crash (`ENOTDIR`):** When packaged into an Electron archive (`app.asar`), directory writes to relative project paths failed with `ENOTDIR`. User data, invoices, and trash are now safely rooted in standard OS user data directories (`~/Library/Application Support/free-gst-billing-software` on macOS, `%APPDATA%\free-gst-billing-software` on Windows).
- **Windows x64 Architecture Support:** Explicitly configured target architecture for 64-bit Intel and AMD Windows systems (`x86-64`), ensuring installers and portable executables run seamlessly across all Windows 10/11 PCs instead of ARM64.
- **Fail-Safe Startup & Error Dialogs:** Replaced silent timeout fallbacks with responsive native error dialogs (`dialog.showErrorBox`) and background child process lifecycle management.
- **Application Icons & Packaging:** Pointed macOS packaging to `public/icons/icon-512.png` and included `CHANGELOG.md` in package distribution assets.
- **CSP Loopback Alignment:** Added `http://127.0.0.1:*` to Content Security Policy `connect-src` so API calls and assets load cleanly in native browser containers.

### How to update

**Current version:** 1.10.81  →  **New version:** 1.10.82

### For Desktop Users (macOS / Windows)
1. Download the new installer from the Assets section below:
   - **macOS:** `Free.GST.Billing.Software-1.10.82-arm64.dmg`
   - **Windows:** `Free.GST.Billing.Software.Setup.1.10.82.exe`
2. Run the installer or replace the `.app` in your Applications folder.
3. Your data is 100% safe — your existing invoices and settings are preserved in your OS Application Support / AppData directory.

### If the in-app Update button works for you
1. Open the Free GST Billing launcher.
2. Click **Update**.
3. Wait for "Update complete", then click **Stop Server**, then **Open App**.

### If the Update button does not work (or you are unsure)
1. Download `Free-GST-Billing.zip` (or `Free-GST-Billing-v1.10.82.zip`) from the Assets section below.
2. Close the app completely (click **Stop Server** first if it is running).
3. Extract the ZIP over your existing Free GST Billing folder, replacing files when prompted.
4. Double-click the launcher again.

### Is my data safe?
Yes. Invoices, clients, products and settings live in your data directory, which an update never touches.

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
- **Direct UPI Integration:** Direct zero-fee instant UPI transfer support with seamless QR scanning across all major UPI apps (GPay, PhonePe, Paytm, BHIM, SBI).
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
