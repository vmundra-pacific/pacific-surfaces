/**
 * Tell IndexNow (Bing, Yandex, Seznam, Naver, Yep; Bing's index also feeds
 * ChatGPT search, Copilot and DuckDuckGo) that the site's pages changed, so
 * they are recrawled within hours instead of waiting for a visit. Google
 * does not take part; it reads the sitemap's <lastmod> dates instead.
 *
 * The key is public by design: IndexNow checks it at /<key>.txt on the
 * site to confirm the submission comes from the site's owner.
 *
 * Submits every URL in the live sitemap. Run after a deploy that changes
 * page content:
 *
 *   node scripts/indexnow.mjs
 */
const HOST = "pacific-surfaces.com";
const KEY = "6f0c7f18c46f3b248f3c39c0657f02c6";

const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) throw new Error("No URLs found in the sitemap");

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${urls.length} URLs submitted, HTTP ${res.status} ${res.statusText}`);
if (!res.ok && res.status !== 202) console.log(await res.text());
