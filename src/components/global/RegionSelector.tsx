"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronDown, Globe, X } from "lucide-react";
import {
  CONTINENTS,
  LANGUAGES,
  findCountry,
  languageByCode,
  languageForCountry,
} from "@/data/regions";
import {
  SOURCE_LANG,
  applyLanguage,
  loadTranslator,
  translatedLanguage,
} from "@/lib/site-translate";
import {
  type Region,
  readRegion as readStored,
  saveRegion as store,
} from "@/lib/region";
import { cn } from "@/lib/utils";

/**
 * Region selector beside the header logo (owner, 2026-10-27: "a button like
 * Cosentino's"; the same dialog: continent, then country, then language,
 * Continue, Remember my selection). Choosing a language translates the
 * site in the browser (lib/site-translate); nothing else changes.
 *
 * A first-time visitor is placed by their country (/api/geo) in that
 * country's language, or their own browser language where the country has
 * it. The choice lasts the visit, or every visit with "Remember my
 * selection". Crawlers and headless browsers are left in English.
 *
 * The button and dialog are marked translate="no": country and language
 * names stay as written, so a visitor can always find their own.
 */

const INTERNATIONAL = "international";

const isRobot = () =>
  typeof navigator !== "undefined" &&
  (navigator.webdriver ||
    /bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(
      navigator.userAgent
    ));

/** Country from the browser's locale ("en-IN" -> IN), for when /api/geo has none. */
function localeCountry(): string | null {
  for (const l of navigator.languages ?? [navigator.language]) {
    const m = /-([A-Z]{2})$/i.exec(l);
    if (m && findCountry(m[1])) return m[1].toUpperCase();
  }
  return null;
}

function regionFor(countryCode: string | null): Region {
  const hit = findCountry(countryCode);
  if (!hit)
    return { continent: INTERNATIONAL, country: null, lang: SOURCE_LANG };
  return {
    continent: hit.continent.id,
    country: hit.country.code,
    lang: languageForCountry(hit.country, navigator.languages ?? []),
  };
}

export function RegionSelector({ className }: { className?: string }) {
  const [region, setRegion] = useState<Region | null>(null);
  const [remembered, setRemembered] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // A translated page (the cookie outlives the tab) needs the widget on
    // every load.
    if (translatedLanguage() !== SOURCE_LANG) loadTranslator().catch(() => {});

    const saved = readStored();
    if (saved) {
      setRegion(saved.region);
      setRemembered(saved.remembered);
      // The country cookie for server-rendered search ends with the
      // browser session; the stored region may outlive it.
      if (!/(?:^|;\s*)ps-country=/.test(document.cookie))
        store(saved.region, saved.remembered);
      return;
    }
    if (isRobot()) {
      setRegion({ continent: INTERNATIONAL, country: null, lang: SOURCE_LANG });
      return;
    }
    let alive = true;
    fetch("/api/geo")
      .then((r) => (r.ok ? r.json() : { country: null }))
      .catch(() => ({ country: null }))
      .then(({ country }: { country: string | null }) => {
        if (!alive) return;
        const next = regionFor(country ?? localeCountry());
        setRegion(next);
        store(next, false);
        if (next.lang !== translatedLanguage())
          applyLanguage(next.lang, false).catch(() => {});
      });
    return () => {
      alive = false;
    };
  }, []);

  const country = findCountry(region?.country)?.country;
  const label = country ? (country.short ?? country.name) : "International";
  const code = country ? country.code : "INT";

  const choose = useCallback((next: Region, remember: boolean) => {
    setRegion(next);
    setRemembered(remember);
    setOpen(false);
    store(next, remember);
    applyLanguage(next.lang, remember).catch(() => {});
  }, []);

  return (
    <>
      <button
        type="button"
        translate="no"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Region: ${label}. Choose your country or region and language`}
        className={cn(
          "notranslate flex items-center gap-1.5 text-current whitespace-nowrap transition-opacity hover:opacity-70",
          "text-[11.5px] min-[1440px]:text-[12.5px] font-medium tracking-[0.08em] uppercase",
          // Holds its place while the visitor's country is looked up.
          !region && "opacity-0",
          className
        )}
      >
        {/* The country's name, as on Cosentino's bar, from tablets up (the
            header's useHeaderFit makes room for it on laptops); on phones
            its code ("PL"), or the globe alone on the narrowest. */}
        <Globe className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span className="hidden min-[375px]:inline min-[640px]:hidden">
          {code}
        </span>
        <span data-fit-optional className="hidden min-[640px]:inline">
          {label}
        </span>
        <ChevronDown
          data-fit-optional
          className="hidden h-3 w-3 shrink-0 min-[640px]:block"
          strokeWidth={1.75}
        />
      </button>
      {open && (
        <RegionDialog
          initial={
            region ?? {
              continent: INTERNATIONAL,
              country: null,
              lang: SOURCE_LANG,
            }
          }
          initialRemember={remembered}
          onClose={() => setOpen(false)}
          onChoose={choose}
        />
      )}
    </>
  );
}

interface Option {
  value: string;
  label: string;
  /** A heading row between groups, not selectable. */
  heading?: boolean;
}

function RegionDialog({
  initial,
  initialRemember,
  onClose,
  onChoose,
}: {
  initial: Region;
  initialRemember: boolean;
  onClose: () => void;
  onChoose: (region: Region, remember: boolean) => void;
}) {
  const [continent, setContinent] = useState(initial.continent);
  const [country, setCountry] = useState<string | null>(initial.country);
  const [lang, setLang] = useState(initial.lang);
  const [remember, setRemember] = useState(initialRemember);
  const titleId = useId();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    boxRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const international = continent === INTERNATIONAL;
  const continentData = CONTINENTS.find((c) => c.id === continent);

  const continentOptions: Option[] = useMemo(
    () => [
      { value: INTERNATIONAL, label: "International" },
      ...CONTINENTS.map((c) => ({ value: c.id, label: c.name })),
    ],
    []
  );
  const countryOptions: Option[] = useMemo(
    () =>
      international
        ? [{ value: INTERNATIONAL, label: "International" }]
        : (continentData?.countries ?? []).map((c) => ({
            value: c.code,
            label: c.name,
          })),
    [international, continentData]
  );
  const languageOptions: Option[] = useMemo(() => {
    const own = international
      ? [SOURCE_LANG]
      : (findCountry(country)?.country.langs ?? []);
    const name = (code: string) => {
      const l = languageByCode(code);
      return l
        ? l.native === l.english
          ? l.native
          : `${l.native} — ${l.english}`
        : code;
    };
    const rest = LANGUAGES.filter((l) => !own.includes(l.code)).sort((a, b) =>
      a.english.localeCompare(b.english)
    );
    return [
      ...own.map((code) => ({ value: code, label: name(code) })),
      { value: "", label: "All languages", heading: true },
      ...rest.map((l) => ({ value: l.code, label: name(l.code) })),
    ];
  }, [international, country]);

  const pickContinent = (id: string) => {
    if (id === continent) return;
    setContinent(id);
    setCountry(null);
    setLang(id === INTERNATIONAL ? SOURCE_LANG : "");
  };
  const pickCountry = (code: string) => {
    const hit = findCountry(code);
    setCountry(code);
    setLang(
      hit
        ? languageForCountry(hit.country, navigator.languages ?? [])
        : SOURCE_LANG
    );
  };

  const ready = Boolean(lang) && (international || Boolean(country));

  return createPortal(
    <div
      translate="no"
      className="notranslate fixed inset-0 z-[500] flex items-center justify-center bg-[rgba(248,248,248,0.7)] px-4"
      onClick={onClose}
      data-lenis-prevent
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] rounded-[5px] bg-white p-8 text-[#3c3c3b] shadow-[0_4px_64px_rgba(0,0,0,0.16)] outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-8 top-8 flex items-center gap-1.5 text-[13px] transition-opacity hover:opacity-60"
        >
          close <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
        <h2
          id={titleId}
          className="pr-16 text-[22px] font-light leading-[1.25] tracking-[0.5px]"
        >
          Choose Your
          <br />
          Country or Region
        </h2>

        <div className="mt-8 space-y-3.5">
          <Field
            placeholder="Continent"
            value={continent}
            options={continentOptions}
            onChange={pickContinent}
          />
          <Field
            placeholder="Country"
            value={international ? INTERNATIONAL : country}
            options={countryOptions}
            onChange={pickCountry}
            disabled={international}
          />
          <Field
            placeholder="Language"
            value={lang || null}
            options={languageOptions}
            onChange={setLang}
            disabled={!international && !country}
          />
        </div>

        <button
          type="button"
          disabled={!ready}
          onClick={() =>
            onChoose(
              {
                continent,
                country: international ? null : country,
                lang: lang || SOURCE_LANG,
              },
              remember
            )
          }
          className="mt-9 inline-flex items-center gap-3 border border-[#212529] px-4 py-2 text-[15px] text-[#212529] transition-colors hover:bg-[#212529] hover:text-white disabled:pointer-events-none disabled:opacity-40"
        >
          Continue <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <label className="mt-5 flex w-fit cursor-pointer items-center gap-2.5 text-[14px] text-[#212529]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 cursor-pointer accent-[#212529]"
          />
          Remember my selection
        </label>
      </div>
    </div>,
    document.body
  );
}

/** A select in the dialog's style: grey field, white list beneath it. */
function Field({
  placeholder,
  value,
  options,
  onChange,
  disabled,
}: {
  placeholder: string;
  value: string | null;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selectable = useMemo(
    () => options.map((o, i) => (o.heading ? -1 : i)).filter((i) => i >= 0),
    [options]
  );
  const selected = options.find((o) => !o.heading && o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    const at = options.findIndex((o) => !o.heading && o.value === value);
    setActive(at >= 0 ? at : (selectable[0] ?? -1));
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, options, value, selectable]);

  useEffect(() => {
    if (open && active >= 0)
      listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const pick = (i: number) => {
    const o = options[i];
    if (!o || o.heading) return;
    onChange(o.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (
      !open &&
      (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    const pos = selectable.indexOf(active);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(selectable[Math.min(pos + 1, selectable.length - 1)]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(selectable[Math.max(pos - 1, 0)]);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      // Type a letter to jump to the first entry starting with it.
      const hit = selectable.find((i) =>
        options[i].label.toLowerCase().startsWith(e.key.toLowerCase())
      );
      if (hit !== undefined) setActive(hit);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={
          selected ? `${placeholder}: ${selected.label}` : placeholder
        }
        className="flex w-full items-center justify-between gap-3 rounded-[3px] bg-[#f0f0ee] px-3 py-2 text-left text-[16px] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={cn("truncate", !selected && "text-[#8a8a87]")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={1.5}
        />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={placeholder}
          data-lenis-prevent
          className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto overscroll-contain rounded-[3px] border border-black/5 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {options.map((o, i) =>
            o.heading ? (
              <li
                key={`h-${o.label}`}
                role="presentation"
                className="px-3 pb-1 pt-3 text-[11px] uppercase tracking-[0.12em] text-[#8a8a87]"
              >
                {o.label}
              </li>
            ) : (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(i)}
                className={cn(
                  "cursor-pointer px-3 py-2 text-[15px]",
                  i === active && "bg-[#f0f0ee]",
                  o.value === value && "font-medium"
                )}
              >
                {o.label}
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
