# Track 3: forms, lead flows, API routes, customer portal, security and reliability

Audit date: 2026-11-20. Branch: `claude/audit-forms-security`.

## Summary

All 22 routes under `src/app/api`, the middleware, the customer portal, `/production`, `/studio`, `src/lib`, and the client side of every form were read. The live site was probed with GET requests only (headers, cookies, private areas, robots); no form was submitted on it. Form routes were exercised against a local dev server with `LEADS_DRY_RUN=1`.

The site's defences are in better shape than most: fields are clamped, e-mail HTML is escaped, GROQ is parameterised everywhere, the visualiser accepts only inline images, the Where to Buy cookie is signed and HttpOnly, and session cookies are `__Host-`/`Secure`/`HttpOnly`/`SameSite=Lax`.

14 defects were fixed in 5 commits. The most important were:

- **Careers uploads were not really type-checked**, and the media proxy would have served such a file from the site's own address.
- **A CV over about 4.5 MB could never be sent**, although the form promised 8 MB.
- **Customer sign-in had no attempt limit**, and a deactivated customer kept access for up to 30 days.
- **A few mistyped PIN codes on Where to Buy locked a visitor out of every form** for ten minutes.

19 items remain open. The ones that matter most are that sample requests and product enquiries send no e-mail to anyone, that every rate limit lives in one server instance's memory, and that five forms have no spam protection.

Counts by severity (fixed + open): critical 0, high 2 + 2, medium 4 + 7, low 8 + 10.

## Findings

| ID  | Sev    | Where                                                      | Evidence                                                                                | Status                         |
| --- | ------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------ |
| F01 | high   | `api/careers/apply`, `api/cdn/[...path]`                   | type check skipped when `type` empty; proxy dropped all protective headers              | fixed 9c92fc0                  |
| F02 | high   | `CareersContent.tsx`                                       | form allowed 8 MB / 20 MB; Vercel refuses bodies over 4.5 MB                            | fixed 8a92855                  |
| F03 | medium | `auth.config.ts`                                           | no limit on sign-in attempts; no hash compared for unknown e-mail                       | fixed a2f4e32                  |
| F04 | medium | `/customer/*`, `api/customer/grievance`                    | JWT never re-checked against `active`                                                   | fixed a2f4e32                  |
| F05 | medium | `api/customer/grievance` POST                              | unbounded text, no limit, 4-hex-digit ticket id from `Math.random`                      | fixed a2f4e32                  |
| F06 | medium | `api/where-to-buy/lead`                                    | 6th POST with a bad PIN returned 429 (local)                                            | fixed 70dc2bf                  |
| F07 | low    | `api/careers/apply`                                        | text fields unbounded                                                                   | fixed 9c92fc0                  |
| F08 | low    | `api/process-surface`, `depth`, `segment`, `segment-point` | provider error text returned to the browser; `x`,`y` unchecked                          | fixed 35bcfed                  |
| F09 | low    | `api/search`, `api/favorites`, `favorites/page.tsx`        | 500 when the CMS is unreachable; unbounded `q` and `ids`                                | fixed 35bcfed                  |
| F10 | low    | `CareersContent.tsx`                                       | stale 4 s timer re-enabled the button mid-upload; error vanished; raw "Failed to fetch" | fixed 8a92855                  |
| F11 | low    | `LoginForm.tsx`                                            | `signIn` rejection left "Signing in…" for good                                          | fixed a2f4e32                  |
| F12 | low    | `lib/cart.tsx`                                             | corrupted stored quantity shows "NaN pieces"                                            | fixed 8a92855                  |
| F13 | low    | `api/contact/submit`, `api/sills-enquiry`                  | line breaks in the message lost in the e-mail                                           | fixed 8a92855                  |
| F14 | low    | `api/cdn/[...path]`                                        | upstream error message sent to the client                                               | fixed 9c92fc0                  |
| O01 | high   | `api/sample-request/submit`                                | route saves to Sanity and sends no mail                                                 | needs owner decision           |
| O02 | high   | `lib/rate-limit.ts`                                        | limits are per warm instance                                                            | needs CMS/Vercel/infra access  |
| O03 | medium | contact, sample, order, newsletter, careers                | no honeypot or CAPTCHA                                                                  | proposal                       |
| O04 | medium | `api/revalidate` (live)                                    | `POST` answers 500 `SANITY_REVALIDATE_SECRET is not set`                                | needs CMS/Vercel/infra access  |
| O05 | medium | `next.config.ts`                                           | no Content-Security-Policy                                                              | for other track (orchestrator) |
| O06 | medium | `lib/consent.ts`                                           | `analytics_storage: 'granted'` before any choice, EU visitors included                  | needs owner decision           |
| O07 | medium | form failure messages                                      | bare `alert()`; fallbacks name `info@thepacific.group`, not the sales inbox             | needs owner decision           |
| O08 | medium | `WhereToBuy.tsx`                                           | no way through when Firebase/reCAPTCHA is blocked                                       | needs owner decision           |
| O09 | medium | `sanity/env.ts`                                            | reads fall back to the write token; dataset privacy not verifiable from here            | needs CMS/Vercel/infra access  |
| O10 | low    | `api/contact/submit`                                       | 503 when SMTP is unset even though Sanity could save                                    | proposal                       |
| O11 | low    | `package.json`                                             | `npm audit`: 39 advisories; `next` 15.5.29 clears two                                   | proposal                       |
| O12 | low    | `/studio`, `/production`                                   | Studio shell public (documented); `/production` has no gate of its own                  | needs owner decision           |
| O13 | low    | `api/certificates/[id]/[page]` (live)                      | plain `curl` receives the page image                                                    | needs owner decision           |
| O14 | low    | `api/cdn/[...path]`                                        | any query string is a new uncached function call                                        | proposal                       |
| O15 | low    | privacy page                                               | no mention of the cookie banner or SMS verification; no unsubscribe exists              | needs owner decision           |
| O16 | low    | `api/newsletter/subscribe`                                 | no confirmation e-mail: anyone can subscribe any address                                | proposal                       |
| O17 | low    | visualiser routes, `api/revalidate`                        | error text names environment variables                                                  | proposal                       |
| O18 | low    | several form components                                    | see "For other tracks"                                                                  | for other track                |
| O19 | low    | `WhereToBuy.tsx`                                           | searched place or rounded coordinates written to the page URL                           | needs owner decision           |

## Details: fixed

### F01. Careers uploads were not type-checked, and the media proxy would serve them from this site (high)

- **What was wrong.** The route accepted a file when its browser-supplied `type` was in a list, and skipped the check when `type` was empty. Nothing looked at the extension or the content. The file went to Sanity under the sender's own filename and content type.
- **Why it matters.** `/api/cdn/files/<project>/<dataset>/<hash>.<ext>` serves any file in the dataset from `pacific-surfaces.com`. A file's address is the hash of its content, so the uploader knows it. The proxy forwarded `content-type` and dropped every other header, including any protection Sanity adds. An HTML or SVG file accepted as a "CV" would then be a page on the site's own origin, able to act as a signed-in customer.
- **Confidence.** High that both gaps existed (code, and the live proxy response carries no CSP). The full chain was not demonstrated: it needs a real upload, which is forbidden on the live site, and `cdn.sanity.io` is blocked here.
- **Fix.** `careers/apply` now requires an allowed extension and the matching file signature (`%PDF`, OLE, ZIP, JPEG, PNG), stores a sanitised filename, and sets the content type from the extension. The proxy now sends `nosniff`, serves anything that is not plain media (JPEG, PNG, WebP, AVIF, GIF, video, audio, PDF) as an `application/octet-stream` download, and sandboxes SVG.
- **Verified locally.** An HTML file named `.html`, and the same file named `.pdf`, both return 400; a real PDF passes validation. The proxy's new headers could not be exercised (no upstream), so check on the Vercel preview that a product video, a spec-sheet PDF and an HD download still open.
- **Side effect to know.** An HD download that is not JPEG/PNG/WebP/PDF (for example TIFF or ZIP) now always downloads instead of opening in a tab.

### F02. A CV over about 4.5 MB could not be sent (high)

- **What was wrong.** The form accepted and advertised 8 MB (CV) and 20 MB (portfolio). Vercel refuses a request body over 4.5 MB before the route runs, with a non-JSON 413, so the candidate saw only "Submission failed".
- **Fix.** The form now caps the two files at 4 MB together, says so, and suggests a link for a larger portfolio. A 413 gets its own message.
- **Confidence.** Medium-high. It rests on Vercel's documented limit; it was not reproduced on the live site, and the careers page does not render locally without the CMS. The copy change ("up to 4 MB") is visible to visitors: please confirm it on the preview.

### F03. Sign-in had no attempt limit (medium)

- **Fix.** 8 tries per account per address and 30 per address, per 15 minutes. A fixed dummy hash is compared when no account matches, so the answer takes the same time either way. Inputs over 320 / 200 characters are refused.
- **Limits.** In memory per instance, like the rest (O02). Not run against a real account: there is no CMS here. The middleware still redirects `/customer/dashboard` to the login page locally.

### F04. A deactivated customer kept access (medium)

- **What was wrong.** `active` was checked only at sign-in. The session is a signed token valid for 30 days and is never looked up again.
- **Fix.** Every portal query now requires `active == true` (`customer->active` on tickets), and the grievance API checks it before writing. Verified by reading the queries only.

### F05. Grievance creation was unbounded (medium)

- Subject and description are now clamped (200 / 5,000 characters), a customer can file 10 an hour, the ticket id uses 8 random hex digits from the system source, and the list response is `private, no-store`.

### F06. Mistyped PIN codes spent the shared form quota (medium)

- **What was wrong.** The limit (5 POSTs per 10 minutes, shared by every form) was counted before validation. The place is only checked by the server, after the OTP step.
- **Fix.** Tries are capped loosely (30 per 10 minutes); the strict shared quota is spent only by a lead about to be saved.
- **Verified locally.** Before: the 6th bad-PIN POST returned 429. After: seven return 400, five complete dry-run leads return 200, and the sixth returns 429.

### F07 to F14 (low)

- **F07.** Careers text fields are clamped with the shared limits; the route now uses the shared escaping helpers instead of its own copy.
- **F08.** The visualiser routes no longer return the model provider's error text, and `x`/`y` must be numbers from 0 to 1 before the paid call is made.
- **F09.** Search now returns the site's own pages when the CMS query fails (verified locally: 200 with pages, where it was a 500). `q` is cut to 100 characters and 8 words; favourites accepts up to 200 well-formed ids and answers 502 instead of crashing. The favourites page no longer throws on a stored non-array.
- **F10.** The careers form cancels its old timer on a new attempt, keeps the error on screen with `role="alert"`, and replaces "Failed to fetch" with a plain sentence.
- **F11.** The login form recovers when the request itself fails.
- **F12.** A stored cart quantity is coerced to 1–99 on read and on first add.
- **F13.** `white-space: pre-wrap` on the message in the contact and sills e-mails.
- **F14.** The proxy logs the upstream failure and answers "Asset unavailable."

## Details: open

### O01. Sample requests and product enquiries send no e-mail (high, owner decision)

`/api/sample-request/submit` writes a `sampleRequest` document and stops. Contact, sills, cart orders, Where to Buy and careers all e-mail someone. A request for a sample, or an "Enquire" from a product page, is seen only if somebody opens Studio → Form Submissions. If that is not checked daily, these leads wait.

Decision needed: should this route also e-mail `COMPANY_EMAIL`, best effort, as `/api/order/submit` does? It is about 30 lines copied from that route.

### O02. Every rate limit is per server instance (high, needs infra)

`lib/rate-limit.ts` keeps its counters in memory, as its own comment says. On Vercel each warm instance has its own, and a new deploy or cold start resets them, so the real ceiling is the limit times the number of instances. The exposure is money: the four visualiser routes call Replicate (billed per call), `careers/apply` stores up to 4 MB per request, and the form routes send mail from a mailbox with a daily quota.

Steps: create an Upstash Redis database through the Vercel Marketplace, add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, and swap the body of `rateLimit()` for `@upstash/ratelimit` (the call sites stay as they are). **This is a new service and may cost money beyond its free tier**; no account or key was created. Also set a monthly spend limit in the Replicate dashboard today, which costs nothing.

### O03. Five forms have no spam protection (medium, proposal)

Sills and Where to Buy have a honeypot. Contact, sample request, cart order, newsletter and careers have none, and none uses a CAPTCHA. Proposal: add the same `website` honeypot to the five (a hidden, named input, and one line in each route), then consider Cloudflare Turnstile (free) if spam appears. Not done here because it edits five UI components that other tracks are working in.

### O04. The revalidation webhook is not configured on production (medium, needs Vercel)

`POST https://pacific-surfaces.com/api/revalidate` answers `500 {"message":"SANITY_REVALIDATE_SECRET is not set"}`. Studio edits therefore reach the site only through the 60-second refresh, not at once as the route's note (owner, 2026-10-30) intends. Steps: generate a secret (`openssl rand -base64 32`), add it on Vercel as `SANITY_REVALIDATE_SECRET` for Production, redeploy, and put the same value in the webhook at manage.sanity.io.

### O05. No Content-Security-Policy (medium, for the orchestrator)

Recommended addition to `securityHeaders` in `next.config.ts`, report-only first so nothing breaks:

```ts
{
  key: "Content-Security-Policy-Report-Only",
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://www.google.com https://www.gstatic.com https://translate.google.com https://translate.googleapis.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://www.gstatic.com https://translate.googleapis.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https://cdn.sanity.io",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://*.google-analytics.com https://*.googleapis.com https://www.facebook.com https://*.firebaseapp.com",
    "frame-src 'self' https://www.googletagmanager.com https://www.google.com https://*.firebaseapp.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; "),
},
```

The host list comes from reading the code, not from a browser run (those hosts are blocked here). Watch the console on a preview, adjust, then rename the header to `Content-Security-Policy`. `frame-ancestors`, `base-uri`, `form-action` and `object-src` are safe to enforce at once. Separately, `X-Frame-Options` could be `DENY` if nothing on the site frames its own pages.

### O06. Analytics runs before consent (medium, owner decision)

`CONSENT_DEFAULTS_SCRIPT` sets `analytics_storage: 'granted'` for everyone; the banner governs advertising only (owner, 2026-10-20). The site now addresses Poland and other EU visitors, where analytics cookies need consent first. Options: default analytics to denied when `/api/geo` reports an EEA/UK country, or for everyone. This is a legal and marketing choice, so nothing was changed.

### O07. What a visitor sees when a form fails (medium, owner decision)

- Contact, the sample modal and the newsletter show one `alert()` for every failure, including "too many submissions", and discard the server's message. "Email us directly" gives no address.
- The enquiry dock, dealer enquiry and sills form show one generic line.
- Fallback text uses `info@thepacific.group` (`data/business.ts:57`), WhatsApp goes to the regional representatives (+91 98940 33566, +91 80505 60007), and the careers 503 names `careers@pacific-surfaces.com`. The project instructions name `bindu@thepacific.group` and WhatsApp +91 73054 77549; that number appears only as the factory's `tel:` line.

Decision needed: which inbox and number are right today. `data/business.ts` belongs to the orchestrator and the routing to regional representatives is dated 1a7bf3e, so this is recorded, not changed. Once decided, showing the server's message with a mail and WhatsApp link is a small change per form.

### O08. Where to Buy has no way through when Google is blocked (medium, owner decision)

With an ad blocker, or on a network that blocks Firebase or reCAPTCHA, "Send code" always fails and the form cannot be submitted. The gate is deliberate (marketing, 2026-10-26). Options: add the phone and WhatsApp links to that error, or accept the lead as unverified after a failed send (the server already records `mobileVerified`).

### O09. Sanity tokens and dataset privacy (medium, needs CMS access)

- `readToken` falls back to `SANITY_API_WRITE_TOKEN` (note of 2026-10-27), so every page render holds a token that can write. Add a Viewer token as `SANITY_API_READ_TOKEN` on Vercel for Production and Preview.
- Please confirm at manage.sanity.io that the `production` dataset is Private. It holds customer password hashes, CVs and leads, and the project id is public. An anonymous query could not be tried from here (the Sanity API is blocked).
- Files in a private dataset are still public to anyone with the URL. A CV's address is unguessable but is not access-controlled.

### O10 to O19 (low)

- **O10.** `contact/submit` and `sills-enquiry` answer 503 when SMTP is not configured, before trying to save. Saving first would keep the lead. Only `where-to-buy/lead` honours `LEADS_DRY_RUN`.
- **O11.** `npm audit`: 39 advisories (20 high, 19 moderate, 0 critical). Almost all are build or Studio tooling (`puppeteer` as a dev dependency, the Sanity CLI, `firebase`'s unused Firestore/gRPC) and need major upgrades. `next` 15.5.28 → 15.5.29 is a patch that clears two advisories in Next itself, one of them about HttpOnly cookies on Edge routes, which the auth middleware is. Run `npm install next@15.5.29 eslint-config-next@15.5.29`. It was tried and reverted here because this sandbox's npm rewrote unrelated lockfile fields.
- **O12.** `/studio` serves the Studio shell to anyone (documented in `middleware.ts`; Sanity's login guards the data). `/production` has no check of its own and relies on the embedded dashboard's login; on the live site it currently shows "not available" because the variable is unset.
- **O13.** `/api/certificates/nsf/1` returns the watermarked page to plain `curl`. The route's note calls the header check a deterrent, so this is as designed; recorded for completeness.
- **O14.** The media proxy has no limit, and each new query string is a fresh function call and Sanity transform. Proposal: pass through only `w`, `h`, `q`, `fit`, `auto`, `fm`, `dpr`, `rect`.
- **O15.** The privacy page tells visitors to control cookies in their browser and does not mention the consent banner, nor SMS verification by Google Firebase. It says newsletter data is kept "until the Data Subject unsubscribes", but the site has no unsubscribe route.
- **O16.** The newsletter has no confirmation e-mail, so any address can be subscribed by anyone.
- **O17.** `"REPLICATE_API_TOKEN not configured"` and the revalidate message name environment variables to anonymous callers.
- **O19.** Where to Buy writes the searched place, or coordinates rounded to two decimals, into the page URL, where Google Analytics may record it.

## For other tracks (O18)

- **Track 2.** `NewGrievanceForm.tsx:70,82,95,109`: labels not tied to their controls. No `role="alert"` on errors in Contact, the sample modal, newsletter, SupportDock, DealerEnquiry and SillsQuote. `CartClient.tsx:461-499`: no `autoComplete` on name, e-mail, phone, address.
- **Track 4.** `ContactContent.tsx:461-464`: the success panel resets to an empty form after 6 seconds. `order-sample-modal.tsx:408-414`: no visible sending state, and earlier notes and address reappear when the modal is reopened. `CartClient.tsx:93-107`: a non-JSON error is reported as a connection problem.
- **Orchestrator.** O05 (CSP) and `data/business.ts` in O07.

## Checked and found sound

- **Injection.** Every GROQ query takes parameters; none is built from input. All e-mail HTML is escaped; subjects and `replyTo` cannot carry a line break. `dangerouslySetInnerHTML` is used only for JSON-LD (escaped by `safeJsonLd`) and static content.
- **Proxy and fetchers.** The media proxy is pinned to the site's own project and dataset. Certificates come from a fixed list of ids. The visualiser accepts only inline images.
- **Access.** One customer cannot read another's tickets or profile: every query is scoped to the session's id. The grievance API answers 401 without a session. The login form reads no `callbackUrl`.
- **Cookies and CSRF.** Session cookies are `__Host-`/`__Secure-`, HttpOnly, `SameSite=Lax`; the Where to Buy cookie is signed with HMAC-SHA256, HttpOnly and compared in constant time; a forged one is refused (tested locally). State-changing routes take JSON or multipart and rely on `SameSite=Lax`.
- **OTP.** The Firebase token is verified against Google's keys, issuer, audience and sign-in provider, and must match the submitted number.
- **Secrets.** Only public values carry `NEXT_PUBLIC_`; Sanity clients are `server-only`; no token or password hash is logged.
- **Private areas.** The portal, Studio and `/production` send `noindex`; personalised responses are `private, no-store`.
- **Lost leads.** Contact, sills, order and Where to Buy save before mailing, and a mail failure does not fail the request.
- **Client.** No name, e-mail, phone or message goes to analytics or browser storage. Buttons are disabled while sending. Typed data survives a failure. The cart is cleared only after success.

## What could not be tested

- Any submission on the live site (forbidden), so SMTP delivery, Sanity writes, Firebase SMS and Replicate calls were not exercised end to end.
- Anything needing the CMS locally: portal pages after sign-in, the sign-in throttle against a real account, the careers page in a browser, and the proxy's new headers against a real asset.
- Whether the dataset is private, and which Vercel variables are set, beyond what the live responses reveal.
- Safari and Firefox. Only Chromium is available, and this track used HTTP requests, not a browser.
- The 3D showroom (parked) and everything fenced for the orchestrator.
