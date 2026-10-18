/**
 * Plain-text helpers for Sanity's Portable Text, for the places that need
 * words rather than formatted copy: meta descriptions, JSON-LD and short
 * intros. Several Sanity fields (product and collection descriptions, blog
 * bodies) are arrays of blocks, not strings, and passing them on raw puts
 * block objects where text belongs.
 */

/** A Portable Text block, as far as plain-text extraction needs one. */
export interface PortableBlock {
  _type?: string;
  children?: { text?: string }[];
}

/**
 * Flatten a Portable Text value (or a plain string) to one paragraph.
 * Non-text blocks such as images are skipped. Null when nothing is left.
 */
export function plainText(
  value: string | PortableBlock[] | null | undefined
): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  if (!Array.isArray(value)) return null;
  const text = value
    .filter((b) => b?._type === "block")
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

/** Cut text to about `max` characters at a word, with an ellipsis. */
export function clipAtWord(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}
