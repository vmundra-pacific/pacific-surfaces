"""
Regenerate the Where to Buy pilot data (Bengaluru) from the internal
Karnataka sample-stand master.

    python scripts/build-dealers-bangalore.py "C:/Users/user/Downloads/Pacific_Karnataka_Sample_Stand_Lollipop_Master.xlsx"
    python scripts/build-dealers-bangalore.py <xlsx> --offline   # cache only, no network

Writes
    src/data/dealers-bangalore.json   the outlets the page lists
    src/data/bangalore-places.json    PIN and locality centroids the search uses

The master is an INTERNAL sheet, so only public business details leave it:
business name, type, address, area, PIN, city, what Pacific material is on
display, and a phone number only when the sheet says it came from the
business's own public listing ("Phone Source" = "Google (...)"). Contact
person names, their mobiles, sales staff, stand status, remarks, costs and
the collateral log are never read into the output.

Coordinates, best first:
  "pin"       the team's own Google Maps pin for the outlet (the short
              maps.app.goo.gl link in the sheet, resolved once by its
              redirect; no API key)
  "address"   OpenStreetMap Nominatim on the street address
  "area"      Nominatim on the locality named in the address
  "pin-code"  the centroid of the outlet's PIN code (lowest confidence)
Every network answer is cached in scripts/_state/dealers-geocode-cache.json,
so a re-run only asks for what changed. Nominatim is called at most once a
second with an identifying User-Agent, per its usage policy.

Needs openpyxl (pip install openpyxl).
"""

from __future__ import annotations

import json
import math
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
OUT_DEALERS = ROOT / "src" / "data" / "dealers-bangalore.json"
OUT_PLACES = ROOT / "src" / "data" / "bangalore-places.json"
CACHE_PATH = ROOT / "scripts" / "_state" / "dealers-geocode-cache.json"

UA = "PacificSurfaces-WhereToBuy-builder/1.0 (+https://pacific-surfaces.com; info@thepacific.group)"
OFFLINE = "--offline" in sys.argv

# Greater Bengaluru, generously (Jigani, Hoskote and the airport included).
BBOX = (12.60, 77.30, 13.35, 77.95)  # south, west, north, east

# --------------------------------------------------------------------------
# Editorial rules (the owner can change these)
# --------------------------------------------------------------------------

# Stand statuses that keep an outlet off the public page.
EXCLUDE_STATUS = {"Stand Withdrawn"}

# Rows left out by name, with the reason printed in the build log.
EXCLUDE_NAMES = {
    "Harish Mane": "the partner name reads as a person's name; confirm the studio's trading name before publishing",
    "Valcucine": "same outlet as 'RISE | Valcucine | Rimadesio' (same address, run by Rise Group); merged into it",
    "Veterans Interiors (Sarjapur Road)": "sheet flags it as probably the same outlet as 'Veterans Kitchen' (HSR, Sarjapur-Marathahalli Rd); merged into it",
}

# Public phone carried from an excluded duplicate onto the row kept.
MERGE_PHONE_FROM = {"RISE | Valcucine | Rimadesio": "Valcucine"}

# Display names, where the sheet's own reads as an internal label.
NAME_FIXES = {
    "RISE | Valcucine | Rimadesio": "RISE · Valcucine · Rimadesio",
    "Wurfel Kuche/Incca": "Wurfel Kuche / Incca",
}

TYPES = {
    "Dealer": ("dealer", "Dealer"),
    "Distributor": ("distributor", "Distributor"),
    "Kitchen Studio": ("kitchen-studio", "Kitchen studio"),
    "Interior Studio": ("interior-studio", "Interior studio"),
}

# Bengaluru localities: canonical name -> aliases matched in addresses and
# searches. Used for the Area filter, the area search and its centroids.
LOCALITIES: dict[str, list[str]] = {
    "HSR Layout": ["HSR Layout", "HSR", "Agara", "Agaram", "Agram"],
    "Indiranagar": ["Indiranagar", "Indira Nagar", "HAL 2nd Stage", "Defence Colony", "Doopanahalli"],
    "Jayanagar": ["Jayanagar", "Jayanagara"],
    "J P Nagar": ["J P Nagar", "JP Nagar", "J. P. Nagar", "Jambusawari Dinne"],
    "Basavanagudi": ["Basavanagudi", "Vishweshwarapura", "Kariappa Rd"],
    "Banashankari": ["Banashankari", "K.R.Road", "K R Road"],
    "Sarjapur Road": ["Sarjapur Road", "Sarjapur - Marathahalli", "Sarjapur Main Road", "Dommasandra", "Domsandra", "Kodathi", "Varthur - Sarjapur", "Sulikunte", "Thigala Chowdadenahalli"],
    "Rajarajeshwari Nagar": ["Rajarajeshwari Nagar", "RR Nagar", "Ideal Homes"],
    "Hennur": ["Hennur", "Kothanur", "Geddalahalli"],
    "HRBR Layout": ["HRBR Layout", "HBR Layout", "HRBR", "Kalyan Nagar"],
    "Banaswadi": ["Banaswadi", "Lakshmamma Layout"],
    "Horamavu": ["Horamavu", "K. Channasandra", "K Channasandra", "k channasandra"],
    "Ashok Nagar": ["Ashok Nagar", "Castle St"],
    "V V Puram": ["VV Puram", "V V Puram", "RV Road", "R V Road"],
    "Bannerghatta Road": ["Bannerghatta Rd", "Bannerghatta Road", "Koppa Gate"],
    "Jakkur": ["Jakkur", "Jakkuru"],
    "Sudhama Nagar": ["Sudhama Nagar", "Mission Rd", "Mission Road"],
    "Rajajinagar": ["Rajajinagar"],
    "Jigani": ["Jigani"],
    "Mysore Road": ["Mysore Road", "Mysuru Road"],
    "Mahadevapura": ["Mahadevapura"],
    "Gollarahatti": ["Gollarahatti"],
    "Soladevanahalli": ["Soladevanahalli"],
    "Bagalur": ["Bagaluru", "Bagalur"],
    "Bidarahalli": ["Bidarahalli"],
    "Adugodi": ["Adugodi"],
    "Whitefield": ["Whitefield"],
    "Yelahanka": ["Yelahanka"],
    "Sadashiva Nagar": ["Sadashiva Nagar", "Sadashivanagar"],
    "Kamakshipalya": ["Kamakshipalya"],
    "T Dasarahalli": ["T. Dasarahalli", "T Dasarahalli", "Dasarahalli"],
    "Koramangala": ["Koramangala"],
    "Marathahalli": ["Marathahalli"],
    "Electronic City": ["Electronic City", "Electronics City"],
    "BTM Layout": ["BTM Layout", "BTM"],
    "Bellandur": ["Bellandur"],
    "Hebbal": ["Hebbal"],
    "Malleshwaram": ["Malleshwaram", "Malleswaram"],
    "MG Road": ["MG Road", "M G Road", "Mahatma Gandhi Road"],
    "Richmond Town": ["Richmond Town", "Richmond Road"],
    "Frazer Town": ["Frazer Town"],
    "Yeshwanthpur": ["Yeshwanthpur", "Yeshwantpur"],
    "Kengeri": ["Kengeri"],
    "Vijayanagar": ["Vijayanagar", "Vijaynagar"],
    "Basaveshwaranagar": ["Basaveshwaranagar", "Basaveshwara Nagar"],
    "Kanakapura Road": ["Kanakapura Road"],
    "Hosur Road": ["Hosur Road"],
    "Old Airport Road": ["Old Airport Road"],
    "Domlur": ["Domlur"],
    "KR Puram": ["KR Puram", "K R Puram", "Krishnarajapuram"],
    "Hoskote": ["Hoskote"],
    "Devanahalli": ["Devanahalli"],
    "Begur": ["Begur"],
    "Hulimavu": ["Hulimavu"],
    "Arekere": ["Arekere"],
    "RT Nagar": ["RT Nagar", "R T Nagar"],
    "Sahakara Nagar": ["Sahakara Nagar", "Sahakaranagar"],
    "Thanisandra": ["Thanisandra"],
    "Vidyaranyapura": ["Vidyaranyapura"],
    "Peenya": ["Peenya"],
    "Nagarbhavi": ["Nagarbhavi"],
    "Uttarahalli": ["Uttarahalli"],
    "Padmanabhanagar": ["Padmanabhanagar"],
    "Kumaraswamy Layout": ["Kumaraswamy Layout"],
    "Wilson Garden": ["Wilson Garden"],
    "Shanti Nagar": ["Shanti Nagar", "Shantinagar"],
    "Ulsoor": ["Ulsoor", "Halasuru"],
    "Cox Town": ["Cox Town"],
    "CV Raman Nagar": ["CV Raman Nagar", "C V Raman Nagar"],
    "Brookefield": ["Brookefield"],
    "Varthur": ["Varthur"],
    "Panathur": ["Panathur"],
    "Kadubeesanahalli": ["Kadubeesanahalli"],
    "Harlur": ["Harlur", "Haralur"],
    "Kasavanahalli": ["Kasavanahalli"],
    "Chandapura": ["Chandapura"],
    "Attibele": ["Attibele"],
    "Anekal": ["Anekal"],
    "Kudlu Gate": ["Kudlu Gate"],
    "Gottigere": ["Gottigere"],
    "Sarjapur": ["Sarjapura", "Sarjapur Town"],
    "Sanjay Nagar": ["Sanjay Nagar", "Sanjaynagar"],
    "Seshadripuram": ["Seshadripuram"],
    "Majestic": ["Majestic", "Gandhi Nagar"],
    "Chickpet": ["Chickpet"],
    "Shivajinagar": ["Shivajinagar"],
    "Jalahalli": ["Jalahalli"],
    "Vasanth Nagar": ["Vasanth Nagar", "Vasanthnagar"],
    "Ejipura": ["Ejipura"],
    "Vivek Nagar": ["Vivek Nagar"],
    "Lalbagh": ["Lalbagh"],
    "Kammanahalli": ["Kammanahalli"],
    "Hennur Road": ["Hennur Road"],
    "Nagawara": ["Nagawara"],
    "Hosa Road": ["Hosa Road"],
    "Bommanahalli": ["Bommanahalli"],
    "Bommasandra": ["Bommasandra"],
    "Kadugodi": ["Kadugodi"],
    "Ramamurthy Nagar": ["Ramamurthy Nagar", "Ramamurthi Nagar"],
}

# Area for a row whose address names no locality we know (checked by hand).
AREA_OVERRIDES: dict[str, str] = {
    # "Sector 2, 27th Main" in the sheet: HSR Layout's 27th Main.
    "Tesor Interior Design Studio": "HSR Layout",
}

# Addresses where the sheet's own is only a fragment (checked by hand).
ADDRESS_OVERRIDES: dict[str, str] = {
    "Tesor Interior Design Studio": "27th Main Road, Sector 2, HSR Layout",
}

# PINs the sheet has wrong (checked against the locality).
PIN_OVERRIDES: dict[str, str] = {
    # Sheet says 560025 (Richmond Town); Thigala Chowdadenahalli, Dommasandra is 562125.
    "Maheshwari Impex": "562125",
}

# PIN codes the search knows (centroids from OpenStreetMap postcode areas).
PIN_CODES = [f"560{n:03d}" for n in range(1, 118)] + [
    "560300", "562106", "562107", "562110", "562114", "562123", "562125",
    "562129", "562130", "562149", "562157", "562162",
]

# --------------------------------------------------------------------------

def squash(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]", "", s.lower())


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")


def in_bbox(lat: float, lng: float) -> bool:
    return BBOX[0] <= lat <= BBOX[2] and BBOX[1] <= lng <= BBOX[3]


cache: dict[str, object] = json.loads(CACHE_PATH.read_text("utf-8")) if CACHE_PATH.exists() else {}
_last_call = [0.0]


def save_cache() -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, indent=1, ensure_ascii=False, sort_keys=True), "utf-8")


def throttle() -> None:
    wait = 1.1 - (time.time() - _last_call[0])
    if wait > 0:
        time.sleep(wait)
    _last_call[0] = time.time()


def nominatim(path: str, params: dict) -> object:
    url = f"https://nominatim.openstreetmap.org/{path}?" + urllib.parse.urlencode({**params, "format": "jsonv2"})
    if url in cache:
        return cache[url]
    if OFFLINE:
        return None
    throttle()
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read().decode("utf-8"))
    cache[url] = data
    save_cache()
    return data


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):  # noqa: D401
        return None


def resolve_short_link(url: str) -> str | None:
    key = "redirect:" + url
    if key in cache:
        return cache[key]  # type: ignore[return-value]
    if OFFLINE:
        return None
    throttle()
    opener = urllib.request.build_opener(_NoRedirect)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    target = None
    try:
        opener.open(req, timeout=30)
    except urllib.error.HTTPError as e:  # 30x lands here because redirects are off
        target = e.headers.get("Location")
    cache[key] = target
    save_cache()
    return target


def coords_from_maps_url(u: str) -> tuple[float, float] | None:
    m = re.search(r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)", u)
    if not m:
        m = re.search(r"@(-?\d+\.\d+),(-?\d+\.\d+)", u)
    if not m:
        return None
    return float(m.group(1)), float(m.group(2))


def first_hit(results: object) -> tuple[float, float, dict] | None:
    if not isinstance(results, list):
        return None
    for r in results:
        lat, lng = float(r["lat"]), float(r["lon"])
        if in_bbox(lat, lng):
            return lat, lng, r
    return None


PIN_RE = re.compile(r"\b(5[56]\d)\s?(\d{3})\b")


def find_pin(text: str) -> str | None:
    pins = ["".join(m) for m in PIN_RE.findall(text or "")]
    # The last PIN in an address is the postal one ("…, 56004, …, 560041").
    pins = [p for p in pins if len(p) == 6]
    return pins[-1] if pins else None


LANDMARK = re.compile(r"\b(opp(osite)?|near|behind|beside|before|after|below|above|next to)\b[^,]*,?", re.I)


def spaced(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return " " + re.sub(r"[^a-z0-9]+", " ", s.lower()).strip() + " "


def find_locality(text: str) -> str | None:
    """The locality named LAST in an address (addresses run from the door
    out to the city, so the last one is the area), longest alias on a tie.
    Aliases match as whole words ("Agara" is not inside "Sadashivanagar");
    long ones also match with the spaces squeezed out ("JP Nagar")."""
    text = LANDMARK.sub("", text or "")
    sp, sq = spaced(text), squash(text)
    best: tuple[int, int, str] | None = None
    for name, aliases in LOCALITIES.items():
        for a in aliases:
            ends = []
            m = None
            for m in re.finditer(re.escape(spaced(a)), sp):
                pass
            if m:
                ends.append(len(squash(sp[: m.end()])))
            sa = squash(a)
            if len(sa) >= 8 and sa in sq:
                ends.append(sq.rfind(sa) + len(sa))
            if not ends:
                continue
            end = max(ends)
            if best is None or (end, len(sa)) > (best[0], best[1]):
                best = (end, len(sa), name)
    return best[2] if best else None


def listing_address(url: str | None, name: str) -> str | None:
    """The street address in a resolved Google Maps link: the outlet's own
    public listing ("?q=Name, address" or "/maps/place/Name, address/")."""
    if not url:
        return None
    u = urllib.parse.urlparse(url)
    text = None
    q = urllib.parse.parse_qs(u.query).get("q")
    if q:
        text = q[0]
    else:
        m = re.search(r"/maps/place/([^/]+)/", u.path)
        if m:
            text = urllib.parse.unquote_plus(m.group(1))
    if not text or "," not in text:
        return None
    parts = [p.strip() for p in text.split(",")]
    # Drop the business's own name wherever it sits ("Sy.no 255, The Stone Shop, 45/46, …").
    sn = squash(name)
    words = [squash(w) for w in name.split()]
    heads = [h for h in (words[0] if words else "", "".join(words[:2])) if len(h) >= 4]

    def is_name(p: str) -> bool:
        sp_ = squash(p)
        return len(sp_) > 3 and (sp_ in sn or sn in sp_ or any(sp_.startswith(h) for h in heads))

    parts = [p for p in parts if p and not is_name(p)]
    a = ", ".join(parts)
    return a if find_pin(a) else None


def geocode_address(addr: str) -> tuple[float, float] | None:
    """Nominatim on the address, then on it with the leading parts dropped one
    at a time (house numbers, buildings, landmarks), accepting a street-level
    or finer hit only."""
    a = re.sub(r"\b(opp(osite)?|near|behind|beside|before|after|below|above|next to)\b[^,]*,", "", addr, flags=re.I)
    a = re.sub(r"\b[0-9A-Z]{4}\+[0-9A-Z]{2,3}\b,?", "", a)  # plus codes
    parts = [p.strip() for p in a.split(",") if p.strip()]
    for k in range(0, min(4, max(1, len(parts) - 2))):
        q = ", ".join(parts[k:])
        if "bengaluru" not in q.lower() and "bangalore" not in q.lower():
            q += ", Bengaluru"
        res = nominatim("search", {"q": q, "countrycodes": "in", "limit": 3})
        if isinstance(res, list):
            for r in res:
                lat, lng = float(r["lat"]), float(r["lon"])
                if in_bbox(lat, lng) and int(r.get("place_rank", 0)) >= 26:
                    return lat, lng
    return None


def clean_address(raw: str, name: str) -> str:
    a = re.sub(r"\s+", " ", raw or "").strip().strip(",")
    # A leading fragment of the business's own name ("lorzy Experience Centre, …").
    head = a.split(",")[0].strip()
    if head and len(head) > 4 and (squash(head) in squash(name) or squash(name).endswith(squash(head))):
        a = a[len(a.split(",")[0]) + 1 :].strip()
    # A stray partial PIN mid-address ("…, 39th Cross, 56004, 3rd Main Rd, …").
    a = re.sub(r",\s*5[56]\d{3}\s*,", ",", a)
    a = re.sub(r",?\s*Karnataka\s*[–-]?\s*\d{6}\s*$", "", a)
    a = re.sub(r",?\s*Karnataka\s*$", "", a)
    a = re.sub(r",?\s*\b5[56]\d\s?\d{3}\s*$", "", a)
    a = re.sub(r",?\s*(Bengaluru|Bangalore)\s*$", "", a, flags=re.I)
    return a.strip().strip(",")


def is_full_address(raw: str) -> bool:
    return bool(raw) and (find_pin(raw) is not None or raw.count(",") >= 2)


def phone_obj(raw: str) -> dict | None:
    first = re.split(r"[/,;]", str(raw))[0]
    digits = re.sub(r"\D", "", first)
    if digits.startswith("91") and len(digits) == 12:
        n = digits[2:]
    elif len(digits) == 10:
        n = digits
    else:
        return None
    if n.startswith("80"):  # Bengaluru landline, 080 xxxx xxxx
        display = f"+91 80 {n[2:6]} {n[6:]}"
    else:
        display = f"+91 {n[:5]} {n[5:]}"
    return {"display": display, "href": f"tel:+91{n}"}


def on_display(details: str) -> list[str]:
    """Colour names on a display slab or wall, as listed in the master."""
    if not details:
        return []
    names: list[str] = []
    for m in re.finditer(r"Display slabs? - ([A-Za-z ]+?) \d", details):
        names.append(m.group(1).strip())
    m = re.search(r"Display wall - \d+ (?:colour )?panels[^(]*\(([^)]*)\)", details)
    if m:
        inner = m.group(1)
        if "+" in inner:  # "Artemis 36x72 in + 17 smaller panels"
            lead = re.match(r"([A-Za-z ]+?) \d", inner)
            more = re.search(r"\+ (\d+)", inner)
            if lead:
                names.append(lead.group(1).strip())
            if more:
                names.append(f"{more.group(1)} more colours")
        else:
            names += [x.strip() for x in inner.split(",") if x.strip()]
    return names


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit(__doc__)
    wb = openpyxl.load_workbook(args[0])  # formulas not needed; no data_only
    ws = wb["Sample Stands"]

    # The real header row sits a few rows down, under the colour key.
    header_row = next(r for r in range(1, 40) if ws.cell(r, 2).value == "Partner Name")
    col = {str(ws.cell(header_row, c).value).strip(): c for c in range(1, ws.max_column + 1) if ws.cell(header_row, c).value}

    def cell(r: int, name: str):
        return ws.cell(r, col[name]).value

    rows = []
    for r in range(header_row + 1, ws.max_row + 1):
        name = cell(r, "Partner Name")
        if not name:
            continue
        rows.append(r)
    by_name = {str(cell(r, "Partner Name")).strip(): r for r in rows}

    dealers, excluded, unclear = [], [], []
    build_notes: dict[str, list[str]] = {}  # printed, never published
    for r in rows:
        name = str(cell(r, "Partner Name")).strip()
        city = (cell(r, "City") or "").strip()
        status = (cell(r, "Stand Status") or "").strip()
        if city.lower() not in ("bengaluru", "bangalore"):
            excluded.append((name, f"city is '{city or 'blank'}', not Bengaluru (pilot is Bengaluru only)"))
            continue
        if status in EXCLUDE_STATUS:
            excluded.append((name, f"stand status '{status}' (no Pacific display there now)"))
            continue
        if name in EXCLUDE_NAMES:
            excluded.append((name, EXCLUDE_NAMES[name]))
            continue

        raw_addr = str(cell(r, "Address / Area") or "").strip()
        if squash(raw_addr) == squash(name):
            raw_addr = ""
        notes = []
        link_cell = ws.cell(r, col["Google Maps"])
        link = link_cell.hyperlink.target if link_cell.hyperlink else None
        link_type = (cell(r, "Map Link Type") or "").strip()
        target = resolve_short_link(link) if link and link_type == "Pinned link" and "goo.gl" in link else None

        # The address: the sheet's, else the outlet's Google Maps listing.
        addr_src = ADDRESS_OVERRIDES.get(name) or raw_addr
        full = is_full_address(addr_src)
        if not full:
            listed = listing_address(target, name)
            if listed:
                addr_src, full = listed, True
                notes.append("address from the outlet's Google Maps listing")
        pin = PIN_OVERRIDES.get(name) or find_pin(addr_src)
        area = AREA_OVERRIDES.get(name) or find_locality(addr_src) or find_locality(raw_addr)

        # --- coordinates
        lat = lng = None
        geo = None
        c = coords_from_maps_url(target or "")
        if c and in_bbox(*c):
            lat, lng = c
            geo = "pin"
        if geo is None and full:
            hit = geocode_address(addr_src)
            if hit:
                lat, lng = hit
                geo = "address"
        if geo is None and area:
            hit = first_hit(nominatim("search", {"q": f"{area}, Bengaluru, Karnataka", "countrycodes": "in", "limit": 3}))
            if hit:
                lat, lng, _ = hit
                geo = "area"
        if geo is None and pin:
            hit = first_hit(nominatim("search", {"postalcode": pin, "country": "in", "limit": 3}))
            if hit:
                lat, lng, _ = hit
                geo = "pin-code"
        if geo is None:
            excluded.append((name, "no usable location (no pin, address, area or PIN)"))
            continue

        # --- PIN and area for rows that only name a locality: from the map
        # pin, never from an area's centre (that would be a guess).
        if (not pin or not area) and geo in ("pin", "address"):
            rev = nominatim("reverse", {"lat": f"{lat:.6f}", "lon": f"{lng:.6f}", "zoom": 16, "addressdetails": 1})
            addr = (rev or {}).get("address", {}) if isinstance(rev, dict) else {}
            if not pin and addr.get("postcode") and PIN_RE.search(addr["postcode"]):
                pin = re.sub(r"\D", "", addr["postcode"])[:6]
                notes.append("PIN from the map pin's location")
            if not area:
                guess = " ".join(str(addr.get(k, "")) for k in ("suburb", "neighbourhood", "city_district", "village", "town"))
                area = find_locality(guess) or (addr.get("suburb") or addr.get("city_district") or addr.get("village") or None)
                if area:
                    notes.append("area from the map pin's location")
        if not area:
            area = "Bengaluru"

        address = clean_address(addr_src, name) if full else ""
        if not full or "address from the outlet's Google Maps listing" in notes:
            unclear.append((name, raw_addr or "(blank)", geo, address))

        kind, label = TYPES.get((cell(r, "Category") or "").strip(), ("dealer", "Dealer"))

        # --- public phone only
        phone = None
        src = str(cell(r, "Phone Source") or "")
        if src.startswith("Google") and cell(r, "POC Phone (91XXXXXXXXXX)"):
            phone = phone_obj(cell(r, "POC Phone (91XXXXXXXXXX)"))
        if phone is None and name in MERGE_PHONE_FROM:
            other = by_name.get(MERGE_PHONE_FROM[name])
            if other and str(cell(other, "Phone Source") or "").startswith("Google"):
                phone = phone_obj(cell(other, "POC Phone (91XXXXXXXXXX)"))

        # --- what Pacific material is on show
        old = cell(r, "Old Stands at Site (Qty)") or 0
        placed = cell(r, "New Stands Placed") or 0
        withdrawal = str(cell(r, "Old Stand Withdrawal") or "")
        samples = (isinstance(placed, (int, float)) and placed > 0) or (
            isinstance(old, (int, float)) and old > 0 and "Empty" not in withdrawal and withdrawal != "Withdrawn"
        )
        details = str(cell(r, "Display / Wall Details") or "")
        colours = on_display(details)
        slabs = bool(re.search(r"Display (slab|wall)", details))

        if notes:
            build_notes[NAME_FIXES.get(name, name)] = notes
        dealers.append(
            {
                "id": slug(name),
                "name": NAME_FIXES.get(name, name),
                "type": kind,
                "typeLabel": label,
                "address": address,
                "area": area,
                "pin": pin or "",
                "city": "Bengaluru",
                "phone": phone,
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "geo": geo,
                "samples": bool(samples),
                "slabs": slabs,
                "onDisplay": colours,
            }
        )

    # Outlets placed on the same approximate point (an area's centre) would
    # stack into one marker: fan them out ~240 m so each can be clicked.
    stacks: dict[tuple, list] = {}
    for d in dealers:
        stacks.setdefault((d["lat"], d["lng"]), []).append(d)
    for (lat0, lng0), group in stacks.items():
        if len(group) < 2:
            continue
        for k, d in enumerate(sorted(group, key=lambda x: x["name"])):
            ang = 2 * math.pi * k / len(group)
            d["lat"] = round(lat0 + 0.0022 * math.sin(ang), 6)
            d["lng"] = round(lng0 + 0.0022 * math.cos(ang) / math.cos(math.radians(lat0)), 6)

    dealers.sort(key=lambda d: d["name"].lower())
    ids = [d["id"] for d in dealers]
    assert len(ids) == len(set(ids)), "duplicate ids"

    # --- places: PIN centroids and localities
    pins: dict[str, list[float]] = {}
    for p in PIN_CODES:
        hit = first_hit(nominatim("search", {"postalcode": p, "country": "in", "limit": 3}))
        if hit:
            pins[p] = [round(hit[0], 5), round(hit[1], 5)]
    localities = []
    for name, aliases in LOCALITIES.items():
        hit = first_hit(nominatim("search", {"q": f"{name}, Bengaluru, Karnataka", "countrycodes": "in", "limit": 3}))
        if hit:
            localities.append({"name": name, "aliases": aliases, "lat": round(hit[0], 5), "lng": round(hit[1], 5)})
    # An area only a dealer row knows ("Central Bengaluru"): the mean of its outlets.
    known = {l["name"] for l in localities}
    for a in sorted({d["area"] for d in dealers} - known):
        pts = [(d["lat"], d["lng"]) for d in dealers if d["area"] == a]
        localities.append({"name": a, "aliases": [a], "lat": round(sum(p[0] for p in pts) / len(pts), 5), "lng": round(sum(p[1] for p in pts) / len(pts), 5)})

    stamp = date.today().isoformat()
    OUT_DEALERS.write_text(
        json.dumps(
            {
                "generated": stamp,
                "source": "Karnataka sample-stand master (internal), Bengaluru rows; public business details only. Regenerate with scripts/build-dealers-bangalore.py.",
                "dealers": dealers,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        "utf-8",
    )
    OUT_PLACES.write_text(
        json.dumps(
            {
                "generated": stamp,
                "source": "OpenStreetMap Nominatim (© OpenStreetMap contributors, ODbL): PIN-code and locality centroids for Bengaluru.",
                "pins": pins,
                "localities": localities,
            },
            indent=1,
            ensure_ascii=False,
        )
        + "\n",
        "utf-8",
    )

    print(f"\nIncluded {len(dealers)} outlets -> {OUT_DEALERS.relative_to(ROOT)}")
    for d in dealers:
        print(f"  + {d['name']:<40} {d['typeLabel']:<16} {d['area']:<22} {d['pin'] or '------'} geo={d['geo']:<8} phone={'yes' if d['phone'] else '-'}")
    print(f"\nExcluded {len(excluded)}:")
    for n, why in excluded:
        print(f"  - {n}: {why}")
    print(f"\nAddress unclear (area only in the sheet) {len(unclear)}:")
    for n, raw, g, a in unclear:
        print(f"  ? {n}: sheet '{raw}' -> published '{a or '(area only)'}' (located by {g})")
    print(f"\nBuild notes (not published) {len(build_notes)}:")
    for n, ns in build_notes.items():
        print(f"  * {n}: {'; '.join(ns)}")
    print(f"\nPlaces: {len(pins)} PIN centroids, {len(localities)} localities -> {OUT_PLACES.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
