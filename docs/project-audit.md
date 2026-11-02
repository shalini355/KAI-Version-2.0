# KAI project audit

**Reviewed:** October 27, 2026

## Summary

- TypeScript checks, ESLint, all 16 tests, and the production build pass.
- The production dependency audit is clean after patching vulnerable transitive
  `body-parser` and `qs` dependencies.
- Nearby psychiatrist search is implemented through Google Places. Real searches
  require a server-side `GOOGLE_MAPS_API_KEY`; location is sent to Google only
  after a user starts a search.
- The downloaded training data is an English empathy-dialogue corpus, not
  clinical mental-health training data. It is licensed CC BY-NC 4.0.
- Package license metadata now matches the repository's MIT `LICENSE` file.

## Findings and follow-ups

| Area                          | Finding                                                                                                                                                | Status                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependency security           | `body-parser@1.20.8` had high-severity CVE-2026-111181 (GHSA-27r3-jxmh-p828), a denial-of-service issue.                                               | Patched to 1.20.9; `npm audit` reports no known vulnerabilities.                                                                                                     |
| Dependency security           | `qs@6.16.0` had a moderate denial-of-service advisory (GHSA-6pq8-jhm2-2vcw).                                                                           | Patched to 6.16.1; the final npm and advisory scans are clean.                                                                                                       |
| License metadata              | `package.json` said `UNLICENSED` while the repository `LICENSE` and README declared MIT.                                                               | Aligned package metadata and lockfile with MIT; training data keeps its separate CC BY-NC 4.0 terms.                                                                 |
| Authentication and local data | Profiles are local convenience profiles, not password-protected accounts. Chat, mood, and journal data in browser storage is not end-to-end encrypted. | Existing prototype limitation; do not use for sensitive production data without a proper identity, privacy, and storage design.                                      |
| Chat data flow                | Chat history is sent to the KAI server and Google Gemini to generate replies.                                                                          | Disclosed in the app privacy policy and README; avoid entering sensitive or identifying information.                                                                 |
| Provider listings             | Google Maps listings and phone numbers may be incomplete or outdated and do not verify professional credentials.                                       | UI warns users, provides Google attribution, and links to public privacy and terms pages. Search is unavailable until a server-side Google Places key is configured. |
| Training data                 | EmpatheticDialogues is crowdsourced, English-only, and not a clinical counseling corpus. The license does not permit commercial use.                   | Downloaded and prepared 76,664 training, 12,027 validation, and 10,923 test examples with source attribution and limitations.                                        |
| Production bundle             | The build succeeds, but the main JavaScript chunk is 500.96 kB, just above Vite's 500 kB warning threshold.                                            | Non-blocking follow-up: consider splitting large dependencies if the app grows.                                                                                      |
| Existing worktree edits       | `git diff --check` reports trailing whitespace in the pre-existing edits to `src/pages/DashboardPage.tsx` and `vite.config.ts`.                        | Left untouched to preserve the user's existing changes.                                                                                                              |

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm test` — 16 tests passed
- `npm run build` — passed; bundle-size warning noted above
- `npm audit --audit-level=moderate` — no vulnerabilities
- Provider endpoint smoke test — health check passed; invalid input returned 400;
  a valid search without a Maps key returned the expected 503 setup message.
