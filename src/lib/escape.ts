/**
 * Escaping helpers for the two places where we interpolate untrusted
 * values into a markup context: notification emails and JSON-LD
 * <script> blocks.
 *
 * These were previously implemented ad-hoc inside
 * src/app/api/careers/apply/route.ts (correctly) and omitted entirely
 * from src/app/api/contact/submit/route.ts (a real HTML-injection
 * hole). Centralised here so every call site shares one audited
 * implementation.
 */

/**
 * Escape a value for interpolation into HTML *text* content.
 * Order matters: `&` must be replaced first, or the ampersands
 * introduced by the later replacements would be double-escaped.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escape a value for interpolation into a quoted HTML *attribute*.
 * Same as escapeHtml plus backtick handling — some legacy IE/Outlook
 * parsers treat a backtick as an attribute delimiter.
 */
export function escapeAttr(value: unknown): string {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

/**
 * Serialise a value for embedding inside a
 * `<script type="application/ld+json">` block via
 * dangerouslySetInnerHTML.
 *
 * JSON.stringify alone is NOT safe here. It does not escape `<`, so a
 * CMS-authored string containing `</script>` terminates the script
 * element early and everything after it is parsed as HTML — a stored
 * XSS sink. Any Sanity editor (or anyone who compromises an editor
 * account) could inject executable script into every page carrying the
 * affected JSON-LD block.
 *
 * Escaping `<`, `>` and `&` to their \uXXXX forms keeps the JSON
 * semantically identical — JSON parsers decode the escapes back to the
 * original characters, and Google's structured-data parser is a
 * standard JSON parser — while making it impossible to break out of
 * the script element. U+2028/U+2029 are also escaped: they are valid
 * in JSON but are literal line terminators in JavaScript, so an
 * unescaped one can break a surrounding script context.
 *
 * The regexes below use \uXXXX escapes rather than literal characters
 * so the source file stays pure ASCII and can't be mangled by an
 * editor or a copy-paste that normalises invisible characters.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * Clamp an untrusted free-text field to a maximum length after
 * trimming. Public form endpoints previously accepted unbounded
 * strings, so a single request could push a multi-megabyte document
 * into Sanity (billed per document, and the dataset is read on every
 * page render).
 *
 * Truncates rather than rejecting: a legitimate user who pastes an
 * over-long message still gets their enquiry through, they just lose
 * the tail. Validation of *required* fields stays with the caller.
 */
export function clampField(value: unknown, maxLength: number): string {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}

/** Field length caps shared by the public form endpoints. */
export const FIELD_LIMITS = {
  name: 200,
  email: 320, // RFC 5321 maximum forward-path length
  phone: 40,
  address: 500,
  shortText: 200, // role, application, source, subject, company…
  message: 5_000,
} as const;
