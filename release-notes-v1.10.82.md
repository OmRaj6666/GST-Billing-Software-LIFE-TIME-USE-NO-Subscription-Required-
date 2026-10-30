# Free GST Billing Software — v1.10.82 (Desktop Fix Release)

### 🚀 Native macOS & Windows Desktop Stability Fix by OM RAJ
100% Free, Zero-Subscription, Privacy-First GST Invoicing & Accounting Software

---

### 📦 Direct Desktop Downloads

| Platform | Installer File | Architecture | Download Link |
| :--- | :--- | :--- | :--- |
| 🍏 **macOS** | `Free.GST.Billing.Software-1.10.82-arm64.dmg` | Apple Silicon (M1/M2/M3/M4) | [⬇ Download macOS DMG](https://github.com/OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-/releases/download/v1.10.82/Free.GST.Billing.Software-1.10.82-arm64.dmg) |
| 🪟 **Windows** | `Free.GST.Billing.Software.Setup.1.10.82.exe` | Windows 10 / 11 (64-bit x64) | [⬇ Download Windows Setup](https://github.com/OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-/releases/download/v1.10.82/Free.GST.Billing.Software.Setup.1.10.82.exe) |
| 💼 **Windows Portable** | `Free GST Billing Software 1.10.82.exe` | Windows 10 / 11 (Standalone) | [⬇ Download Windows Portable](https://github.com/OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-/releases/download/v1.10.82/Free%20GST%20Billing%20Software%201.10.82.exe) |
| 📦 **Universal ZIP** | `Free-GST-Billing.zip` | All Platforms (Browser / Portable) | [⬇ Download Portable ZIP](https://github.com/OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-/releases/download/v1.10.82/Free-GST-Billing.zip) |

*(Both installers include the bundled offline Express engine and full client frontend with zero external dependencies).*

---

### 🛠️ What Was Fixed in v1.10.82

- **Resolved Blank Screen & Startup Crash (`ENOTDIR`):** When packaged into an Electron archive (`app.asar`), directory writes to relative project paths failed with `ENOTDIR`. User data, invoices, and trash are now safely rooted in standard OS user data directories (`~/Library/Application Support/free-gst-billing-software` on macOS, `%APPDATA%\free-gst-billing-software` on Windows).
- **Windows x64 Architecture Support:** Explicitly configured target architecture for 64-bit Intel and AMD Windows systems (`x86-64`), ensuring installers and portable executables run seamlessly across all Windows 10/11 PCs instead of ARM64.
- **Fail-Safe Startup & Error Dialogs:** Replaced silent timeout fallbacks with responsive native error dialogs (`dialog.showErrorBox`) and background child process lifecycle management.
- **Application Icons & Packaging:** Pointed macOS packaging to `public/icons/icon-512.png` and included `CHANGELOG.md` in package distribution assets.
- **CSP Loopback Alignment:** Added `http://127.0.0.1:*` to Content Security Policy `connect-src` so API calls and assets load cleanly in native browser containers.

---

### How to update

**Current version:** 1.10.81  →  **New version:** 1.10.82

#### For Desktop Users (macOS / Windows)
1. Download the new installer from the Assets section below:
   - **macOS:** `Free.GST.Billing.Software-1.10.82-arm64.dmg`
   - **Windows:** `Free.GST.Billing.Software.Setup.1.10.82.exe`
2. Run the installer or replace the `.app` in your Applications folder.
3. Your data is 100% safe — your existing invoices and settings are preserved in your OS Application Support / AppData directory.

#### If the in-app Update button works for you
1. Open the Free GST Billing launcher.
2. Click **Update**.
3. Wait for "Update complete", then click **Stop Server**, then **Open App**.

#### If the Update button does not work (or you are unsure)
1. Download `Free-GST-Billing.zip` (or `Free-GST-Billing-v1.10.82.zip`) from the Assets section below.
2. Close the app completely (click **Stop Server** first if it is running).
3. Extract the ZIP over your existing Free GST Billing folder, replacing files when prompted.
4. Double-click the launcher again.

#### Is my data safe?
Yes. Invoices, clients, products and settings live in your data directory, which an update never touches.

---

### 🔗 Project Links & Documentation

- **GitHub Repository:** [OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-](https://github.com/OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-)
- **Maintainer:** OM RAJ ([@OmRaj6666](https://github.com/OmRaj6666))
- **LinkedIn Profile:** [om-raj-vit](https://www.linkedin.com/in/om-raj-vit/)
- **Contact Email:** [omraj6666@gmail.com](mailto:omraj6666@gmail.com)
