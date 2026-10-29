# Comprehensive Project Report: Free GST Billing Software (Enterprise Desktop Edition)

**Author / Maintainer**: OM RAJ ([GitHub](https://github.com/OmRaj6666) · [LinkedIn](https://www.linkedin.com/in/om-raj-vit/) · omraj6666@gmail.com)  
**Target Platforms**: macOS (`.dmg`), Windows 10/11 (`.exe`), Linux (`AppImage`)  
**Technology Stack**: React 19, Vite, Express 5.2, Electron 35, Node.js, `pdf-lib`, `tesseract.js`  
**License**: MIT  
**Date**: October 2026  

---

## Executive Summary

**Free GST Billing Software** is an enterprise-grade, offline-native, cross-platform billing, taxation, and invoice management desktop application built specifically for Indian Small and Medium Enterprises (MSMEs), freelancers, chartered accountants, and trade businesses.

The application addresses critical pain points present in commercial billing platforms (such as Tally, Marg ERP, Zoho Books, and Vyapar): expensive recurring SaaS subscriptions, vendor lock-in, forced cloud storage of proprietary customer records, and privacy exposure. By operating completely **offline-first** on local hardware while providing native macOS (`.dmg`) and Windows (`.exe`) installers, the platform guarantees that 100% of the financial ledger, GSTINs, and customer data remain strictly under the business owner's control.

The system incorporates a mathematically rigorous Indian GST calculation engine (Intrastate, Interstate, Union Territory GST, Cess, Reverse Charge Mechanism, and TDS/TCS), automated GSTR-1 and GSTR-3B JSON portal exports, GSTR-2B Input Tax Credit reconciliation, dynamic UPI QR code embedding, client-side PDF compilation, and offline OCR document scanning.

---

## Table of Contents

1. [Problem Statement & Market Analysis](#1-problem-statement--market-analysis)
2. [High-Level Architecture & Technology Stack](#2-high-level-architecture--technology-stack)
3. [Financial & Taxation Engine Implementation](#3-financial--taxation-engine-implementation)
4. [Reverse Engineering & Security Audit Report](#4-reverse-engineering--security-audit-report)
5. [Database Design & Atomic Persistence Layer](#5-database-design--atomic-persistence-layer)
6. [Desktop Application Packaging (.dmg and .exe)](#6-desktop-application-packaging-dmg-and-exe)
7. [Testing, Quality Assurance & Verification Suite](#7-testing-quality-assurance--verification-suite)
8. [Key Engineering Highlights for Technical Interviews](#8-key-engineering-highlights-for-technical-interviews)

---

## 1. Problem Statement & Market Analysis

### 1.1 Existing Industry Deficiencies
In India, the Goods and Services Tax (GST) regime requires frequent, error-free compliance filings:
* **Tax Invoices vs. Bills of Supply**: Differentiating registered B2B entities, unregistered B2C clients, SEZ developers, and nil-rated / composition vendors.
* **Complex Multi-Tier Tax Splitting**: Calculating CGST + SGST (states), CGST + UTGST (Union Territories like Delhi, Chandigarh, Ladakh), and IGST (interstate transactions), alongside Cess, RCM, and TCS under Section 206C(1H) / TDS under Section 194Q.
* **High SaaS Barriers**: Major billing platforms charge steep annual fees (₹3,000 to ₹25,000/year per user), locking data behind proprietary encrypted databases.
* **Data Sovereignty Risks**: Cloud-hosted billing tools continuously transmit customer names, phone numbers, transaction volumes, and profit margins to third-party servers.

### 1.2 The Solution
Free GST Billing Software provides an open-source, non-custodial, high-performance desktop platform that runs locally, requires zero cloud subscriptions, writes to human-readable JSON files, and generates government-ready portal exports with zero latency.

---

## 2. High-Level Architecture & Technology Stack

The application employs a decoupled **Client-Server-Container** architecture encapsulated in a native operating system shell:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Electron 35 Native Desktop Container                 │
│         macOS Window (.dmg)  │  Windows 10/11 Desktop (.exe)           │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Presentation Layer (UI/UX)                   │  │
│  │   • React 19.3 Single Page Application                           │  │
│  │   • Vite 7.3 High-Performance Build Pipeline                     │  │
│  │   • Modern Glassmorphic CSS with Adaptive Dark/Light Mode        │  │
│  │   • Client-Side PDF Generation (pdf-lib, html2canvas, jspdf)     │  │
│  │   • Optical Character Recognition (tesseract.js offline model)   │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │ HTTP / REST on Loopback
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Hardened Express 5.2 Server (Backend API)               │
│                                                                        │
│   • Loopback-only Binding (Strictly bound to 127.0.0.1)                │
│   • Dynamic Port Reservation (47371–47420 range)                       │
│   • Anti-DNS Rebinding Host Validation (`localhost:47371`)             │
│   • Strict Origin Whitelisting (CORS lockdown)                         │
│   • Scrypt Key Derivation & Ephemeral API Session Tokens               │
│   • Object Prototype Pollution Immunization (`__proto__` blocking)     │
│   • Two-Tier Path Traversal Firewall (`safePathSegment` & `isPathInside`)│
│   • Atomic File I/O Engine (`writeFileAtomic` via .tmp + rename)       │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │ POSIX File Operations
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Local Filesystem Storage (data/)                  │
│                                                                        │
│   ├── bills/         ├── recurring/     ├── profiles/   ├── backups/   │
│   ├── clients/       ├── receipts/      ├── purchases/  └── meta.json  │
│   └── products/      └── expenses/      └── trash/                     │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown
1. **Frontend**: Built with **React 19** and **Vite**, optimizing DOM diffing, instant reactive state updates, and tree-shaken production bundles.
2. **Backend**: An embedded **Express 5.2** instance acting as a microservice executing on the loopback adapter (`127.0.0.1`).
3. **Container**: **Electron 35** with `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`, providing secure desktop window lifecycles for both macOS and Windows.
4. **Data Persistence**: Normalized flat JSON directories in `./data/`, guaranteeing durability, transparent inspection, and painless backup synchronization.

---

## 3. Financial & Taxation Engine Implementation

The core mathematical engine (`src/utils.js`) implements all statutory Indian GST and Income Tax requirements:

### 3.1 Interstate vs. Intrastate Determination
* Given Supplier State Code $S_{pos}$ and Recipient State Code $R_{pos}$:
  $$\text{Tax Regime} = \begin{cases} \text{IGST} & \text{if } S_{pos} \neq R_{pos} \text{ or Export / SEZ} \\ \text{CGST + UTGST} & \text{if } S_{pos} = R_{pos} \text{ and } S_{pos} \in \text{Union Territories} \\ \text{CGST + SGST} & \text{if } S_{pos} = R_{pos} \text{ and } S_{pos} \notin \text{Union Territories} \end{cases}$$
* Where Union Territories without separate legislature (Andaman & Nicobar, Chandigarh, Dadra & Nagar Haveli and Daman & Diu, Ladakh, Lakshadweep) are mapped automatically to `UTGST`.

### 3.2 Tax Back-Calculation (Tax-Inclusive Pricing)
When an item is sold at a gross tax-inclusive price $P_{gross}$ at GST rate $r$:
$$P_{taxable} = \frac{P_{gross}}{1 + \frac{r}{100}}$$
$$\text{Tax Amount} = P_{gross} - P_{taxable}$$

### 3.3 Multi-Mode Discount System
Discounts are handled per-line and at invoice level across three distinct accounting modes:
1. **Percentage Discount**: $D = P_{base} \times \frac{pct}{100}$
2. **Fixed Unit Discount**: $D = \text{Amount} \times \text{Quantity}$
3. **Tax-Inclusive Discount**: Deducted after tax calculation to preserve exact consumer cash outlays.

### 3.4 TDS & TCS Compliance
* **Section 194Q (TDS)**: Withheld by buyer when annual purchases exceed ₹50 Lakhs (0.1%).
* **Section 206C(1H) (TCS)**: Collected by seller on aggregate receipts exceeding ₹50 Lakhs (0.075% or 0.1%).

---

## 4. Reverse Engineering & Security Audit Report

A comprehensive static analysis and reverse engineering scan was conducted using **REA (Reverse Engineer Anything)** across the codebase (95 files, 89 parsed JS/JSX files, 269,662 AST nodes visited).

The audit identified and mitigated seven critical security threat vectors:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THREAT VECTOR AUDIT & MITIGATION                │
├────────────────────────────────┬───────────────────────────────────────┤
│ Threat Vector                  │ Implemented Mitigation                │
├────────────────────────────────┼───────────────────────────────────────┤
│ 1. DNS Rebinding Attacks       │ Strict Host Header Validation          │
│ 2. Cross-Origin Theft (CORS)   │ Origin Regex Whitelist (`localhost`)  │
│ 3. Remote Network Access       │ Strict `127.0.0.1` Socket Binding     │
│ 4. Object Prototype Pollution  │ Forbidden Key Filtering (`__proto__`) │
│ 5. Unauthenticated API Abuse   │ Scrypt PIN Hash + Session Tokens      │
│ 6. Local Path Traversal        │ Two-Tier Directory Boundary Guard     │
│ 7. Stored Cross-Site Scripting │ DOMPurify Client-Side Sanitization    │
└────────────────────────────────┴───────────────────────────────────────┘
```

### 4.1 Anti-DNS Rebinding & Host Header Validation
* **Vulnerability**: If an attacker tricks a user into visiting `http://rebind.attacker.com` pointing to `127.0.0.1`, requests bypass traditional loopback boundaries.
* **Fix**: Added explicit `req.headers.host` inspection rejecting any request that does not match `localhost`, `127.0.0.1`, or `[::1]`:
  ```javascript
  const host = req.headers.host;
  const allowHost = !host || /^localhost(:\d+)?$/i.test(host) ||
    /^127\.0\.0\.1(:\d+)?$/i.test(host) || /^\[::1\](:\d+)?$/i.test(host);
  if (!allowHost) return res.status(403).json({ error: 'Invalid host header' });
  ```

### 4.2 Object Prototype Pollution Defense
* **Vulnerability**: Dynamic parameters in `/api/meta/:key` allowed setting properties on in-memory objects, exposing potential prototype overrides if an attacker submitted `__proto__` or `constructor`.
* **Fix**: Enforced a strict blacklist (`DANGEROUS_KEYS`) blocking `__proto__`, `constructor`, and `prototype`:
  ```javascript
  const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype', LOCK_KEY]);
  if (DANGEROUS_KEYS.has(req.params.key)) return errRes(res, 403, 'forbidden');
  ```

### 4.3 Scrypt PIN Lock & Ephemeral Session Tokens
* **Vulnerability**: Previously, the App Lock was purely a UI-level overlay; the Express API endpoints were unprotected.
* **Fix**: Upgraded lock verification to generate a 32-byte cryptographically secure session token (`crypto.randomBytes(32).toString('hex')`). Protected API endpoints now require this session token in the `X-App-Token` header when the lock is active.

### 4.4 Path Traversal Defense
* **Vulnerability**: File export and deletion routines take client-supplied file and folder names.
* **Fix**: Built a two-tier containment boundary:
  1. `safePathSegment()` replaces all `/`, `\`, and squashes `..` sequences.
  2. `isPathInside(target, parent)` resolves absolute paths and verifies that the canonical path starts with the authorized directory prefix.

---

## 5. Database Design & Atomic Persistence Layer

### 5.1 Storage Schema
The database operates without SQL/NoSQL engine overhead. Each entity is stored in a clean directory hierarchy:

| Directory | Entity Type | File Naming Convention |
| :--- | :--- | :--- |
| `data/bills/` | Invoices, Bills of Supply, Credit Notes | `[safeInvoiceNumber].json` |
| `data/clients/` | Client Master Records & Ledgers | `cli_[timestamp].json` |
| `data/products/` | Product & Service Inventory | `prod_[timestamp].json` |
| `data/expenses/` | Daily Operating Expenses | `exp_[timestamp].json` |
| `data/purchases/`| Inward Purchase Bills for ITC | `pur_[timestamp].json` |
| `data/recurring/`| Automated Recurring Invoices | `rec_[timestamp].json` |
| `data/receipts/` | Payment Vouchers & Cash Receipts | `rcp_[timestamp].json` |
| `data/meta.json` | Global Counters, PIN Hash, Preferences | Singleton JSON file |

### 5.2 Atomic Write Engine (`writeFileAtomic`)
To guarantee that sudden power loss, OS crashes, or battery failure never corrupt invoice numbers or financial records:
1. Payload is serialized to `[path].tmp`.
2. `fs.writeFileSync` flushes bytes to disk synchronously.
3. `fs.renameSync` performs an atomic filesystem inode swap.

### 5.3 Automated Backups & Dual-Folder Redundancy
* **Local Retention**: Backups are created automatically once per day in `data/backups/YYYY-MM-DD` and retained for 30 days.
* **Secondary Location**: Users can select an external drive, USB stick, or Google Drive folder via `/api/backup-folder` for secondary mirror copies.

---

## 6. Desktop Application Packaging (.dmg and .exe)

To provide a true native installation experience, the project includes an automated packaging pipeline via **Electron 35** and **Electron Builder 25**:

```
                         npm run build:desktop
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
      macOS Build Pipeline                    Windows Build Pipeline
   (Apple Silicon & Intel)                     (x64 & ARM64 Windows)
              │                                         │
     • .app Bundle Packaging                  • NSIS Setup Installer (.exe)
     • DMG Disk Image (.dmg)                  • Portable Executable (.exe)
     • Background Daemon Binding              • Native App Icon (.ico)
```

### Build Commands:
```bash
# Build desktop packages for the host machine:
npm run build:desktop

# Build macOS installer (.dmg):
npm run build:mac

# Build Windows installer (.exe):
npm run build:win
```

### Binary Output Artifacts:
* **macOS**: `release-desktop/Free GST Billing Software-1.10.81.dmg`
* **Windows**: `release-desktop/Free GST Billing Software Setup 1.10.81.exe`
* **Windows Portable**: `release-desktop/Free GST Billing Software 1.10.81.exe`

---

## 7. Testing, Quality Assurance & Verification Suite

The repository incorporates an extensive, two-tiered automated verification suite:

### 7.1 Unit Testing Framework
* **`scripts/tax-test.mjs`**: Validates tax calculation against real-world sample invoices, testing intra-state split, inter-state IGST, and Union Territory UTGST.
* **`scripts/discount-modes-test.mjs`**: Confirms line-item unit discounts, percentage discounts, and tax-inclusive calculations across large arrays.
* **`scripts/csv-test.mjs`**: Validates RFC 4180 compliant CSV parsing for bulk client and inventory uploads.

### 7.2 Playwright Browser Smoke Test Suite (`tests/smoke.mjs`)
Runs headless Firefox to verify critical operational flows:
1. Invoice creation, PDF preview, and rendering fidelity.
2. App Lock verification, wrong-PIN lockout (429 status code), and recovery via `RESET-PIN`.
3. GSTR-1 and GSTR-3B export generation.
4. Client ledger balancing and credit note deductions.
5. Backup restoration and counter reconciliation.

---

## 8. Key Engineering Highlights for Technical Interviews

When presenting this project during technical reviews, portfolio defenses, or interviews, emphasize these core engineering achievements:

1. **System Design & Local-First Philosophy**:
   * Architected an enterprise-grade billing system requiring zero internet connectivity and zero external database daemons.
   * Eliminates cloud operational costs entirely while ensuring 100% data privacy for sensitive financial records.

2. **Security & Threat Mitigation**:
   * Identified and mitigated real-world vulnerabilities (DNS Rebinding, Prototype Pollution, Stored XSS, and Path Traversal).
   * Implemented salted Scrypt hashing with constant-time equality checks and issued ephemeral session tokens to bridge UI security with backend API protection.

3. **Complex Domain Logic (Indian Taxation)**:
   * Accurately encoded complex tax rules: Section 194Q TDS, Section 206C(1H) TCS, Reverse Charge Mechanism, and Union Territory UTGST splits.
   * Engineered automated GSTR-1 / GSTR-3B JSON exporters matching the exact schema requirements of the Indian GST portal.

4. **Cross-Platform Engineering**:
   * Packaged native installers (`.dmg` for macOS and `.exe` for Windows) with an Electron wrapper that manages the background Express process and maintains sandbox isolation.

---
*Report Compiled & Certified by Omraj · October 2026*
