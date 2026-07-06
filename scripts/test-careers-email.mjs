/**
 * One-shot Resend send test for the careers form.
 *
 * Sends a single notification email using the same env vars and
 * sender address the live /api/careers/apply route will use, so
 * if THIS works, the production form is wired correctly. If
 * Resend rejects (most commonly: domain not verified, sender
 * address not allowed) the rejection prints in full so you can
 * fix the cause.
 *
 * Usage
 * -----
 *   npm run test:careers-email
 *     # → sends to shyam@thepacific.group by default
 *
 *   npm run test:careers-email -- --to=hr@thepacific.group
 *     # → override the recipient
 *
 * Environment variables consumed (loaded from .env.local via the
 * `--env-file` flag in package.json):
 *   - RESEND_API_KEY       (required)
 *   - CAREERS_FROM_EMAIL   (required — the From: address)
 *   - CAREERS_INBOX_EMAIL  (used as recipient if --to not supplied)
 */

import { Resend } from "resend";

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const eq = a.indexOf("=");
      return eq === -1
        ? [a.slice(2), "true"]
        : [a.slice(2, eq), a.slice(eq + 1)];
    })
);

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.CAREERS_FROM_EMAIL;
// Default recipient is the user's own work address — explicit
// confirmation that the From: address can land in the same
// domain's inbox without bouncing.
const to = args.to || "shyam@thepacific.group";

if (!apiKey) {
  console.error(
    "× RESEND_API_KEY is missing from .env.local. Add it and try again."
  );
  process.exit(1);
}
if (!from) {
  console.error(
    "× CAREERS_FROM_EMAIL is missing from .env.local. Add it and try again."
  );
  process.exit(1);
}

console.log(`→ Sending test email`);
console.log(`  from: ${from}`);
console.log(`  to:   ${to}`);
console.log("");

const resend = new Resend(apiKey);

try {
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Pacific Surfaces — careers form Resend test (delete after read)",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #112732;">
        <h2 style="margin: 0 0 16px 0; font-weight: 400; font-size: 20px;">Resend wiring test ✓</h2>
        <p style="font-size: 14px; line-height: 1.6;">
          If you're reading this, the live <code>/api/careers/apply</code>
          route can deliver application notifications. The same
          <strong>From:</strong> address (<code>${from}</code>) and
          API key are now driving the careers form.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #6b7785;">
          Sent at ${new Date().toISOString()} from a one-shot test
          script. Safe to delete.
        </p>
      </div>
    `,
    text:
      `Resend wiring test ✓\n\nIf you're reading this, the live /api/careers/apply ` +
      `route can deliver application notifications. The same From: address ` +
      `(${from}) and API key are now driving the careers form.\n\n` +
      `Sent at ${new Date().toISOString()}.`,
  });

  if (error) {
    console.error("× Resend rejected the send:");
    console.error(error);
    console.error("");
    console.error(
      "  Most common cause: the sending domain (the part after @ in"
    );
    console.error(
      `  CAREERS_FROM_EMAIL=${from}) hasn't been verified in Resend yet.`
    );
    console.error(
      "  Verify at https://resend.com/domains and add the SPF/DKIM"
    );
    console.error(
      "  TXT records to your DNS provider (Cloudflare, GoDaddy, etc.)."
    );
    process.exit(1);
  }

  console.log("✓ Send accepted by Resend");
  console.log(`  Message id: ${data?.id ?? "(no id returned)"}`);
  console.log("");
  console.log(`  Check ${to} for delivery. Most domains receive within 30s.`);
  console.log("  If it never arrives, check the Resend dashboard's Logs view");
  console.log("  (https://resend.com/logs) — bounces and spam-folder routing");
  console.log("  show up there in real time.");
} catch (err) {
  console.error("× Unhandled error during send:");
  console.error(err);
  process.exit(1);
}
