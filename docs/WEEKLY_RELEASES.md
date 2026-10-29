# Weekly releases: one update every Saturday

From v1.10.81, Free GST Billing ships **one update every Saturday** with that
week's fixes and new features. Users are told this in the app (Support &
About), in the README, on the docs site and in the GitHub issue forms, so the
promise has to be kept.

## Where requests come in

Everything goes through **GitHub issues**, using the two forms in
`.github/ISSUE_TEMPLATE/`:

- **Report a problem** (`bug` label): app version, computer, steps, error text,
  screenshots, and `node -v` / `npm -v` when the app does not start.
- **Ask for a feature** (`enhancement` label): the job they are trying to do,
  how they do it today, their kind of business, an example.

The app's Support & About page links straight to both forms.

## The week

| Day | What happens |
|---|---|
| **Sunday – Monday** | Read every new issue. Reply within a day: thank them, say whether it is a bug (fixed this week), already in the app (point to it), or a request (noted). Add the `this-saturday` label to what goes into the coming update. |
| **Tuesday – Thursday** | Fix and build. Reproduce every bug first, add a test that fails without the fix, log it in `docs/KNOWN_ERRORS.md`. Features get the docs-site page updated in the same change. |
| **Friday** | Freeze. Review the week's changes (an independent review, not the author's), then run the full gate: `npm run release:zip` (lint, unit tests, build, fresh install, smoke), the Docker fresh install, and `npm run test:update-unix`. Write the CHANGELOG entry with its **How to update** block. |
| **Saturday** | Release: bump the version, commit, push, create the GitHub release with one `Free-GST-Billing.zip`, swap the v1.10.44 asset, check `releases/latest`. Reply on every issue that shipped and close it. Redeploy the docs site. |

## Rules

1. **One release a week, on Saturday.** If nothing is ready, skip the week
   rather than ship something untested.
2. **Urgent fixes do not wait.** If people cannot open the app, cannot
   install or update it, or could lose data, release the fix as soon as it
   passes the gate (a hotfix), then carry on with the weekly plan.
3. **`package.json` on `main` stays at the last released version** until the
   release commit on Saturday. Older installs read it to decide whether an
   update exists (ERR-057), so merging early offers users a version they cannot
   download.
4. **Never merge a pull request without a local review and the full gate**,
   including ones written by an AI session or a contributor.
5. **Every release has the How to update block** (see `RELEASE_CHECKLIST.md`)
   and credits the reporters by @handle.
6. **Reply when it ships**, on each issue, with how to update. Close it then,
   not before.

## Release day checklist

- [ ] `this-saturday` issues are all fixed, or moved to next week with a note
- [ ] CHANGELOG entry dated today, with How to update, reporters credited
- [ ] Version bumped in `package.json`, `package-lock.json`, `docs-site/site.mjs`
- [ ] `npm run release:zip` passes (lint 0 errors, unit tests, smoke on a fresh install)
- [ ] Docker fresh install passes, and `npm run test:update-unix`
- [ ] Committed and pushed; release `v<version>` with one `Free-GST-Billing.zip`
- [ ] `gh api repos/OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-/releases/latest` shows the new tag
- [ ] Replies posted, shipped issues closed
- [ ] Docs site rebuilt and zipped into `release-build/` (never with PowerShell's
      `Compress-Archive`: it writes `\` paths and the site 404s on the host, ERR-061):
      ```
      node docs-site/build.mjs
      cd docs-site/out && tar -a -c -f ../../release-build/docs-v<version>.zip free-gst-software-documentation && cd ../..
      node scripts/check-zip-paths.mjs release-build/docs-v<version>.zip
      ```
      then uploaded in place of `/free-gst-software-documentation/` on the documentation host
