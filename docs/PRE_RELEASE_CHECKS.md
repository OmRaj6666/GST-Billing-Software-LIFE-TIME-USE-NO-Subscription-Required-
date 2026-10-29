# Before publishing a release: every check

Go through this **every time**, including hotfixes. Each line is here because
that mistake already reached users once; the ERR numbers point to
[KNOWN_ERRORS.md](KNOWN_ERRORS.md). Nothing is "too small to check".

The order is the order to do them in. **Do not publish while any box is
unticked.**

---

## 1. While fixing (Tuesday to Thursday)

- [ ] **Reproduce every reported bug first**, on a copy with fake data, before changing code.
- [ ] **A test that fails without the fix** (`scripts/tax-test.mjs`, `scripts/csv-test.mjs`, or `tests/smoke.mjs` for screens).
- [ ] **A KNOWN_ERRORS entry** for every user-reported bug: the exact message, the cause, the rule, the guard.
- [ ] **Fix the cause in the shared place**, then check every other caller of what you changed (the PR #102 discount fix changed invoices already saved, ERR-059).
- [ ] **Saved data stays as it was saved.** A maths change applies to new documents only (ERR-059).
- [ ] **Never trust a tool by its name**: check versions (`node -v` was 6.10 on two users' PCs, ERR-060).

## 2. Review (Friday)

- [ ] **An independent review of everything since the last release**, by someone (or an agent) that did not write it, given the code, not the conclusion. That includes every merged pull request, whoever wrote it (PR #102 was merged unreviewed and had 2 serious bugs).
- [ ] Every HIGH and MEDIUM finding fixed or written down as a known limit.

## 3. Build and the automated checks

```
npm run release:zip      # lint (0 errors) + unit tests + build + ZIP + fresh install + smoke suite
npm run docs:zip         # the docs site, zipped with "/" paths (never Compress-Archive, ERR-061)
npm run release:check    # everything below marked [auto]
```

`release:check` must end with **"All automated checks passed"**. It checks:

- [auto] package.json, package-lock.json and docs-site/site.mjs carry the same version
- [auto] CHANGELOG starts with this version, **dated**, with the **How to update** block
- [auto] the release ZIP: `/` paths only (ERR-014, ERR-061), server.js where the launchers look, all four launcher files and READ ME FIRST present
- [auto] **every `.command` and `.sh` executable inside the ZIP** (ERR-062: Macs refused to open the launcher, #120)
- [auto] ensure-node.ps1 and check-node.sh are shipped (#109)
- [auto] the docs ZIP: `/` paths, index.html and support.html in the right folder (ERR-061)
- [auto] every `.ps1` and READ ME FIRST.txt is plain ASCII (ERR-001); every `.sh` / `.command` uses LF (ERR-014)
- [auto] supporters.json is valid
- [auto] on `main`, everything committed
- [auto] the version is newer than the latest release, and `main` on GitHub still says the last release (ERR-057: users were offered a version that did not exist)

## 4. Test on real systems (the script cannot do these)

- [ ] **Docker, fresh Ubuntu install** of the exact ZIP + the smoke suite (`docker77/run.sh` in the playwright image).
- [ ] **`npm run test:update-unix`**: the Linux / NAS updater in Alpine and Debian.
- [ ] **If anything under `release-templates/` changed:** run **Open App** from the extracted ZIP on Windows with a fake old Node.js first on PATH (a `node.cmd` printing `v6.10.1`) and an empty or half-done `node_modules`; it must repair itself and start (ERR-060).
- [ ] **Every changed screen opened in a browser**, light and dark and phone width, and **the screenshots looked at**, not only the test results (an underlined button and a duplicate "Welcome" title were only caught that way).
- [ ] Browser tests that click through the changed features pass.
- [ ] **Mac:** we cannot test on a Mac here, so the [auto] executable check above is the guard. The READ ME FIRST, README and docs explain the first-open "Apple cannot check it" message (Control-click → Open).

## 5. Words users read

- [ ] CHANGELOG and release notes: what changed **in the user's words**, the How to update block, reporters credited by @handle, the next Saturday date.
- [ ] If the updater itself was broken: the manual-download warning at the top.
- [ ] Docs pages updated for every changed screen (`docs-site/pages/`), and **READ ME FIRST.txt, README and the docs troubleshooting page say the same** for any new error message.
- [ ] Every button and menu name in the text **checked against the code** (grep the label).
- [ ] No real customer data, GSTIN, bank details or phone numbers in screenshots or text; use the demo "Kaveri Stationers".

## 6. Publish

- [ ] Run only **one** build or gate at a time (two at once overwrite each other's files).
- [ ] Secrets scan of the diff, then commit and push to `main`.
- [ ] `gh release create v<ver>` with **one** file named **`Free-GST-Billing.zip`**, and the notes.
- [ ] Swap the v1.10.44 asset to the new ZIP.
- [ ] `gh api repos/OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-/releases/latest` shows the new tag and one asset; the README download link returns 200.
- [ ] Upload the docs ZIP to documentation host, extract it, and **open the live docs** and click three links (it must say the new version).

## 7. After

- [ ] Reply on every issue that shipped, with how to update, then close it. Issues for next week get the `this-saturday` label and the date.
- [ ] Stop only the test servers **you** started (check the command line and start time; other node processes on this PC are the maintainer's tools).
- [ ] Files for the maintainer go in `release-build/`, never a temp folder.

## Never

- Never bump `package.json` on `main` before the release itself (ERR-057). `supporters.json` may be pushed any time.
- Never zip with PowerShell's `Compress-Archive` (ERR-061).
- Never re-upload a ZIP onto an older release tag (ERR-003).
- Never skip a step because "it is only a small change".
