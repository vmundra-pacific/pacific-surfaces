/**
 * Page translation for the region selector (owner, 2026-10-27: the free
 * Google Translate widget; content and data stay as they are, the page is
 * translated in the browser when a language other than English is chosen).
 *
 * The widget is driven by its `googtrans` cookie ("/en/<lang>"): set before
 * the script loads, the page comes up translated, and every later page
 * load does the same. The script is only fetched when a language other
 * than English is in effect, so English visitors download nothing extra.
 *
 * React and Google Translate: the widget wraps translated text in <font>
 * elements, so when React later removes or moves one of those text nodes
 * its parent is no longer the one React expects and removeChild /
 * insertBefore throw, taking the page down. The patch below (React issue
 * #11538) turns those two calls into no-ops when the node has moved. It
 * is installed only on translated pages.
 */

export const SOURCE_LANG = "en";
const COOKIE = "googtrans";
const SCRIPT_ID = "google-translate-script";
const SCRIPT_URL =
  "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

/**
 * Inline in <head> (app/layout): on a page that is to be translated (the
 * googtrans cookie names another language) the widget script and its three
 * hosts are fetched while the page is still loading, instead of after React
 * has hydrated (2026-10-28, owner: translation is slow). It only fetches:
 * the widget itself still starts after hydration (loadTranslator), because
 * translating a page React has not yet taken over breaks hydration. English
 * visitors run nothing here and download nothing extra.
 */
export const TRANSLATE_WARMUP_SCRIPT = String.raw`try{var m=document.cookie.match(/(?:^|;\s*)googtrans=\/[^\/;]*\/([^;]+)/);if(m&&decodeURIComponent(m[1])!=="en"){[["preconnect","https://translate.google.com"],["preconnect","https://translate.googleapis.com"],["preconnect","https://www.gstatic.com"],["preload","${SCRIPT_URL}"]].forEach(function(x){var l=document.createElement("link");l.rel=x[0];l.href=x[1];if(x[0]==="preload")l.as="script";document.head.appendChild(l)})}}catch(e){}`;

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: Record<string, unknown>,
          elementId: string
        ) => unknown;
      };
    };
  }
}

/** The language the page is translated into ("en" when it isn't). */
export function translatedLanguage(): string {
  const m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/;]*\/([^;]+)/);
  return m ? decodeURIComponent(m[1]) : SOURCE_LANG;
}

/** Cookie domains the widget may have written to: the host and its parent. */
function cookieDomains(): (string | undefined)[] {
  const host = location.hostname;
  const bare = host.replace(/^www\./, "");
  return [undefined, host, `.${host}`, `.${bare}`];
}

function writeCookie(lang: string, remember: boolean) {
  const age = remember ? "; max-age=31536000" : "";
  document.cookie = `${COOKIE}=/${SOURCE_LANG}/${lang}; path=/${age}; SameSite=Lax`;
}

function clearCookie() {
  for (const d of cookieDomains())
    document.cookie = `${COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${d ? `; domain=${d}` : ""}`;
}

let patched = false;
function patchDomForTranslation() {
  if (patched || typeof Node !== "function") return;
  patched = true;
  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(
    this: Node,
    child: T
  ): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };
  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    this: Node,
    node: T,
    ref: Node | null
  ): T {
    if (ref && ref.parentNode !== this) return node;
    return insertBefore.call(this, node, ref) as T;
  };
}

/**
 * Have the widget translate text that arrived after it last looked. It
 * re-scans the page only when the window scrolls (checked 2026-10-27: a
 * page opened by in-site navigation stayed English until the first
 * scroll), so new content is announced with a scroll event. The page does
 * not move; the site's own scroll handlers read an unchanged position.
 */
export function nudgeTranslator() {
  window.dispatchEvent(new Event("scroll"));
}

let watching = false;
/** Nudge the widget whenever the site adds content: a new page, a menu,
 *  a dialog. Debounced, so a burst of changes costs one round of nudges.
 *  Three, because the widget skips text that is still fading in: a page's
 *  sections animate in over the first second or so. */
function watchForNewContent() {
  if (watching) return;
  watching = true;
  let timers: number[] = [];
  new MutationObserver((records) => {
    if (!records.some((r) => r.addedNodes.length)) return;
    timers.forEach(clearTimeout);
    timers = [150, 700, 2000].map((ms) =>
      window.setTimeout(nudgeTranslator, ms)
    );
  }).observe(document.body, { childList: true, subtree: true });
}

let linksHooked = false;
/**
 * While translated, links within the site load the next page in full
 * instead of Next swapping it in: the widget translates a page as it
 * loads, but a page swapped in afterwards stayed English even with the
 * nudges above (checked 2026-10-27). English visitors keep instant
 * in-site navigation; this only runs once a translation is on.
 */
function loadLinksInFull() {
  if (linksHooked) return;
  linksHooked = true;
  window.addEventListener(
    "click",
    (e) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const a = (e.target as Element | null)?.closest?.(
        "a[href]"
      ) as HTMLAnchorElement | null;
      if (
        !a ||
        (a.target && a.target !== "_self") ||
        a.hasAttribute("download")
      )
        return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      // Same page (an in-page anchor such as #quote) or not a page at all.
      if (url.pathname === location.pathname && url.search === location.search)
        return;
      if (/^\/(api|studio)(\/|$)/.test(url.pathname)) return;
      e.preventDefault();
      e.stopPropagation();
      location.assign(url.href);
    },
    true
  );
}

let loading: Promise<void> | null = null;

/** Fetch and start the widget once; it translates to the cookie's language. */
export function loadTranslator(): Promise<void> {
  if (loading) return loading;
  patchDomForTranslation();
  loading = new Promise<void>((resolve, reject) => {
    let host = document.getElementById("google_translate_element");
    if (!host) {
      host = document.createElement("div");
      host.id = "google_translate_element";
      host.style.display = "none";
      document.body.appendChild(host);
    }
    window.googleTranslateElementInit = () => {
      if (window.google?.translate)
        new window.google.translate.TranslateElement(
          { pageLanguage: SOURCE_LANG, autoDisplay: false },
          "google_translate_element"
        );
      watchForNewContent();
      loadLinksInFull();
      resolve();
    };
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = SCRIPT_URL;
    s.async = true;
    s.onerror = () => {
      loading = null;
      reject(new Error("Google Translate could not be loaded"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** The widget's own (hidden) language list, once it has rendered. */
async function combo(): Promise<HTMLSelectElement | null> {
  for (let i = 0; i < 50; i++) {
    const el = document.querySelector<HTMLSelectElement>(
      "select.goog-te-combo"
    );
    if (el && el.options.length > 1) return el;
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
}

/**
 * Show the site in `lang`. English takes the page back to its original
 * text, which the widget can only do reliably with a reload.
 */
export async function applyLanguage(
  lang: string,
  remember: boolean
): Promise<void> {
  const current = translatedLanguage();
  if (lang === SOURCE_LANG) {
    if (current !== SOURCE_LANG) {
      clearCookie();
      location.reload();
    }
    return;
  }
  clearCookie();
  writeCookie(lang, remember);
  if (!loading) {
    await loadTranslator();
    return;
  }
  await loading;
  const select = await combo();
  if (select && select.value !== lang) {
    select.value = lang;
    select.dispatchEvent(new Event("change"));
  }
}
