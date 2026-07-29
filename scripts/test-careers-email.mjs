/**
 * One-shot SMTP send test for the careers form.
 *
 * Sends a single notification email using the same SMTP transport
 * and credentials the live /api/careers/apply route uses (shared
 * with the Contact form — see src/lib/mail.ts), so if THIS works,
 * the production form can deliver application notifications.
 *
 * Usage
 * -----
 *   npm run test:careers-email
 *     # → sends to muthusamyg@pacific-surfaces.com by default
 *
 *   npm run test:careers-email -- --to=hr@thepacific.group
 *     # → override the recipient
 *
 * Environment variables consumed (loaded from .env.local via the
 * `--env-file` flag in package.json):
 *   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS  (required)
 *   - CAREERS_INBOX_EMAIL  (used as recipient if --to not supplied,
 *                           falls back to muthusamyg@pacific-surfaces.com)
 */

import nodemailer from "nodemailer";

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

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
const to =
  args.to || process.env.CAREERS_INBOX_EMAIL || "muthusamyg@pacific-surfaces.com";

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  console.error(
    "× SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS must all be set in .env.local. Add them and try again."
  );
  process.exit(1);
}

console.log(`→ Sending test email`);
console.log(`  from: ${SMTP_USER}`);
console.log(`  to:   ${to}`);
console.log("");

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

try {
  const info = await transporter.sendMail({
    from: `"Pacific Surfaces Careers" <${SMTP_USER}>`,
    to,
    subject: "Pacific Surfaces — careers form SMTP test (delete after read)",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #112732;">
        <h2 style="margin: 0 0 16px 0; font-weight: 400; font-size: 20px;">SMTP wiring test ✓</h2>
        <p style="font-size: 14px; line-height: 1.6;">
          If you're reading this, the live <code>/api/careers/apply</code>
          route can deliver application notifications through the same
          SMTP account (<code>${SMTP_USER}</code>) that already powers
          the Contact form.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #6b7785;">
          Sent at ${new Date().toISOString()} from a one-shot test
          script. Safe to delete.
        </p>
      </div>
    `,
    text:
      `SMTP wiring test ✓\n\nIf you're reading this, the live /api/careers/apply ` +
      `route can deliver application notifications through the same SMTP ` +
      `account (${SMTP_USER}) that already powers the Contact form.\n\n` +
      `Sent at ${new Date().toISOString()}.`,
  });

  console.log("✓ Send accepted by SMTP server");
  console.log(`  Message id: ${info.messageId ?? "(no id returned)"}`);
  console.log("");
  console.log(`  Check ${to} for delivery.`);
} catch (err) {
  console.error("× SMTP server rejected the send:");
  console.error(err);
  process.exit(1);
}
