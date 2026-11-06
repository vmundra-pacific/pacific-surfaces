"""
Regenerate the Where to Buy directory (all of India) from the internal
all-regions dealer and distributor master.

    python scripts/build-dealers-india.py "C:/Users/user/Downloads/Pacific_All_Regions_Dealer_Distributor_Master.xlsx"
    python scripts/build-dealers-india.py <xlsx> --offline   # cache only, no network

Writes
    src/data/dealers-india.json   the outlets the page lists
    src/data/india-places.json    city, locality and PIN centres the search uses

Replaces build-dealers-bangalore.py (Bengaluru pilot, 2026-10-24); the
Karnataka tab of the new master carries every column of the old
sample-stand master, so Bengaluru is built by the same rules as before.

The master is an INTERNAL sheet, so only public business details leave it:
business name, type, address, area, PIN, city, and whether Pacific samples
or slabs are on show. A phone number is published only when the sheet says
it came from the business's own public listing (Karnataka "Phone Source" =
"Google (...)"), or from the business's Sanity `dealer` document. Contact
persons, their mobiles, sales staff, stand and signage status, remarks,
costs, the collateral logs and the potential-distributor list are never
read into the output.

Coordinates, best first:
  "pin"       the team's own Google Maps link for the outlet (the short
              maps.app.goo.gl link, resolved once by its redirect; no key)
  "address"   OpenStreetMap Nominatim on the street address
  "area"      Nominatim on the locality (or, for a small town, the town)
  "pin-code"  the centre of the outlet's PIN code (lowest confidence)
Every answer must fall within reach of the outlet's own city. Every network
answer is cached in scripts/_state/dealers-geocode-cache.json, so a re-run
only asks for what changed. Nominatim is called at most once a second with
an identifying User-Agent, per its usage policy.

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
OUT_DEALERS = ROOT / "src" / "data" / "dealers-india.json"
OUT_PLACES = ROOT / "src" / "data" / "india-places.json"
CACHE_PATH = ROOT / "scripts" / "_state" / "dealers-geocode-cache.json"

UA = "PacificSurfaces-WhereToBuy-builder/1.0 (+https://pacific-surfaces.com; info@thepacific.group)"
OFFLINE = "--offline" in sys.argv

# --------------------------------------------------------------------------
# Cities: canonical name -> (state, search aliases, reach in km). An outlet's
# coordinates must fall within `reach` of its city's centre.
# --------------------------------------------------------------------------

CITIES: dict[str, tuple[str, list[str], int]] = {
    # Karnataka
    "Bengaluru": ("Karnataka", ["Bengaluru", "Bangalore", "Blr"], 45),
    "Davanagere": ("Karnataka", ["Davanagere", "Davangere"], 20),
    "Belagavi": ("Karnataka", ["Belagavi", "Belgaum"], 20),
    # Maharashtra
    "Mumbai": ("Maharashtra", ["Mumbai", "Bombay"], 40),
    "Thane": ("Maharashtra", ["Thane"], 15),
    "Navi Mumbai": ("Maharashtra", ["Navi Mumbai", "Vashi", "Turbhe", "Nerul", "Belapur"], 20),
    "Kalyan": ("Maharashtra", ["Kalyan"], 12),
    "Vasai": ("Maharashtra", ["Vasai", "Vasai-Virar", "Virar"], 15),
    "Pune": ("Maharashtra", ["Pune", "Poona"], 35),
    # Telangana and Andhra Pradesh
    "Hyderabad": ("Telangana", ["Hyderabad", "Secunderabad", "Cyberabad"], 45),
    "Warangal": ("Telangana", ["Warangal"], 20),
    "Bhimavaram": ("Andhra Pradesh", ["Bhimavaram", "Bheemavaram"], 15),
    "Anantapur": ("Andhra Pradesh", ["Anantapur", "Ananthapur", "Anantapuramu"], 15),
    # Kerala
    "Thiruvananthapuram": ("Kerala", ["Thiruvananthapuram", "Trivandrum"], 25),
    "Kollam": ("Kerala", ["Kollam", "Quilon", "Kolllam"], 20),
    "Alappuzha": ("Kerala", ["Alappuzha", "Alleppey", "Alapuzha"], 20),
    "Kottayam": ("Kerala", ["Kottayam"], 20),
    "Kochi": ("Kerala", ["Kochi", "Cochin", "Ernakulam"], 30),
    "Perumbavoor": ("Kerala", ["Perumbavoor", "Kuruppampady", "Kurupumpady", "Kurpumpady"], 12),
    "Angamaly": ("Kerala", ["Angamaly", "Angamali"], 12),
    "North Paravur": ("Kerala", ["North Paravur", "Paravur", "Parur"], 12),
    "Thrissur": ("Kerala", ["Thrissur", "Trichur"], 20),
    "Palakkad": ("Kerala", ["Palakkad", "Palghat"], 25),
    "Kozhikode": ("Kerala", ["Kozhikode", "Calicut"], 25),
    "Malappuram": ("Kerala", ["Malappuram", "Malapuram"], 20),
    "Perinthalmanna": ("Kerala", ["Perinthalmanna", "Perthilmanna"], 12),
    "Manjeri": ("Kerala", ["Manjeri"], 12),
    "Kannur": ("Kerala", ["Kannur", "Cannanore"], 20),
    "Kasaragod": ("Kerala", ["Kasaragod", "Kasargod"], 20),
    # Punjab, Haryana, Chandigarh, Uttarakhand
    "Chandigarh": ("Chandigarh", ["Chandigarh", "Tricity"], 15),
    "Mohali": ("Punjab", ["Mohali", "SAS Nagar", "Zirakpur"], 15),
    "Panchkula": ("Haryana", ["Panchkula"], 15),
    "Ludhiana": ("Punjab", ["Ludhiana"], 25),
    "Jalandhar": ("Punjab", ["Jalandhar", "Jullundur"], 20),
    "Phagwara": ("Punjab", ["Phagwara"], 12),
    "Karnal": ("Haryana", ["Karnal"], 20),
    "Panipat": ("Haryana", ["Panipat"], 20),
    "Dehradun": ("Uttarakhand", ["Dehradun", "Dehra Dun"], 20),
    # Delhi NCR
    "Delhi": ("Delhi", ["Delhi", "New Delhi", "NCR"], 45),
    # West Bengal
    "Kolkata": ("West Bengal", ["Kolkata", "Calcutta"], 35),
    # Tamil Nadu
    "Chennai": ("Tamil Nadu", ["Chennai", "Madras"], 45),
    "Coimbatore": ("Tamil Nadu", ["Coimbatore", "Kovai"], 30),
    "Tiruppur": ("Tamil Nadu", ["Tiruppur", "Tirupur"], 20),
    "Salem": ("Tamil Nadu", ["Salem"], 20),
    "Erode": ("Tamil Nadu", ["Erode"], 20),
    "Madurai": ("Tamil Nadu", ["Madurai"], 20),
    "Tiruchirappalli": ("Tamil Nadu", ["Tiruchirappalli", "Trichy", "Tiruchi"], 20),
    "Karur": ("Tamil Nadu", ["Karur"], 15),
    "Namakkal": ("Tamil Nadu", ["Namakkal"], 15),
    # Gujarat
    "Rajkot": ("Gujarat", ["Rajkot"], 20),
    "Ahmedabad": ("Gujarat", ["Ahmedabad", "Amdavad"], 30),
}

# Big cities: an outlet located only to the city itself is too vague to
# rank by distance, so it is left out (and reported) until an address or a
# map link is added. A small town's centre is close enough.
METROS = {
    "Bengaluru", "Mumbai", "Pune", "Hyderabad", "Chennai", "Kolkata", "Delhi",
    "Coimbatore", "Kochi", "Ahmedabad", "Thiruvananthapuram", "Kozhikode",
}

# First digits of the PIN codes of each state (a PIN elsewhere is a typo).
STATE_PINS = {
    "Karnataka": ("56", "57", "58", "59"),
    "Maharashtra": ("40", "41", "42", "43", "44"),
    "Telangana": ("50",),
    "Andhra Pradesh": ("51", "52", "53"),
    "Kerala": ("67", "68", "69"),
    "Tamil Nadu": ("60", "61", "62", "63", "64"),
    "Delhi": ("11",),
    "Haryana": ("12", "13"),
    "Punjab": ("14", "15", "16"),
    "Chandigarh": ("16",),
    "Uttarakhand": ("24", "26"),
    "West Bengal": ("70", "71", "72", "73", "74"),
    "Gujarat": ("36", "37", "38", "39"),
}

CITY_ALIAS = {}
for _c, (_s, _aliases, _r) in CITIES.items():
    for _a in _aliases + [_c]:
        CITY_ALIAS[re.sub(r"[^a-z0-9]", "", _a.lower())] = _c

# --------------------------------------------------------------------------
# Editorial rules (the owner can change these)
# --------------------------------------------------------------------------

# Karnataka stand statuses that keep an outlet off the public page.
EXCLUDE_STATUS = {"Stand Withdrawn"}

# Rows left out by name, with the reason printed in the build log.
EXCLUDE_NAMES = {
    "Harish Mane": "the partner name reads as a person's name; confirm the studio's trading name before publishing",
    "Valcucine": "same outlet as 'RISE | Valcucine | Rimadesio' (same address, run by Rise Group); merged into it",
    "Veterans Interiors (Sarjapur Road)": "sheet flags it as probably the same outlet as 'Veterans Kitchen' (HSR, Sarjapur-Marathahalli Rd); merged into it",
}

# Public phone carried from an excluded duplicate onto the row kept.
MERGE_PHONE_FROM = {"RISE | Valcucine | Rimadesio": "Valcucine"}

# Display names, where the sheet's own reads as an internal label or is
# typed in capitals.
NAME_FIXES = {
    "RISE | Valcucine | Rimadesio": "RISE · Valcucine · Rimadesio",
    "Wurfel Kuche/Incca": "Wurfel Kuche / Incca",
    "M/s. HELIOS STONE SURFACES LLP": "Helios Stone Surfaces",
    "Livingstone Marketing PVT LTD": "Livingstone Marketing",
    "Casa Di Pietra Designs Private Limited": "Casa Di Pietra Designs",
    "Ceratec Marble India Private Limited": "Ceratec Marble India",
    "Simpolo Tiles & Bathware - Umiya Marble And Ceramic": "Umiya Marble and Ceramic (Simpolo Tiles & Bathware)",
    "Rastro gallery sultanpur": "Rastro Gallery",
    "De ceramica": "De Ceramica",
    "Sanico Distributor pvt ltd": "Sanico Distributor",
    "JD bath & works": "JD Bath & Works",
    "GoodHomes": "GoodHomes",
}

# The same business under another spelling in another tab: merged.
SAME_AS = {
    "Casa de pietra": "Casa Di Pietra Designs Private Limited",
    "Livingstone": "Livingstone Marketing PVT LTD",
    "LIVINGSTONE": "Livingstone Marketing PVT LTD",
    "La Casa, Décor, Panchkula": "La Casa Decor",
    # The directory's Ceratec and the Pune list's showroom and godown share
    # one address (36/7/5, Ambegaon Budruk).
    "Ceratec Marble India Private Limited": "Ceratec Marble Showroom",
    "Ceratec Godown": "Ceratec Marble Showroom",
    "shanthinath granites": "SHREE SHANTHINATH GRANI WORLD",
    # Kerala Regions spellings of the Kerala Contacts names.
    "TROIPCAL": "Tropical",
    "KAMATH CERMAICS": "Kamath Ceramics",
    "EDAPPYAIL FLOORING": "Edappayil Flooring",
    "ASSOIATED GRANITE WORLD": "Associated Granite World",
    "STILES HOUSE": "Stile House",
    "SILVAN": "Silvan Gallery",
    "Modern Ambaince": "Modern Ambiance",
}

# Names as published, after the casing is fixed: typos and branch labels.
SHOWN_FIXES = {
    "Ceratec Marble Showroom": "Ceratec Marble India",
    "Nysa Interiros": "Nysa Interiors",
    "SMT Interiros": "SMT Interiors",
    "SNS Tiles & Sanitary,Srinagar Clny": "SNS Tiles & Sanitary",
    "Wurfeel": "Wurfel Kuche",
    "Wurfil": "Wurfel Kuche",
    "Wurful": "Wurfel Kuche",
    "Hacker": "Hacker Kitchen",
    "Kumaran Ganites": "Kumaran Granites",
    "Beautiful Home'S": "Beautiful Homes",
    "PLATINUM MODULAR SOLUTIONS (blum)": "Platinum Modular Solutions (Blum)",
    "Shree Shanthinath Grani World": "Shree Shantinath Granite World",
    "SSGW": "Shree Shantinath Granite World, Gachibowli",
    "Cbwe Luxe Surfaces Experience Centre": "CBWE Luxe Surfaces Experience Centre",
    "Modern Ambiance": "Modern Ambiance",
}


def published_name(raw: str, karnataka: bool) -> str:
    """The name as the page shows it: capitals and lower case evened out,
    "Pvt Ltd" dropped, known typos fixed."""
    if raw in NAME_FIXES:
        return NAME_FIXES[raw]
    if karnataka:
        return raw
    n = nice_case(raw)
    n = re.sub(r"[\s,]*\b(pvt\.?\s*ltd\.?|private limited|ind\.\s*pvt\.?\s*ltd\.?)\s*$", "", n, flags=re.I).strip()
    n = " ".join(w[0].upper() + w[1:] if w[:1].islower() and w.lower() not in SMALL_WORDS else w for w in n.split(" "))
    return SHOWN_FIXES.get(n, n)

TYPES = {
    "Dealer": ("dealer", "Dealer"),
    "Distributor": ("distributor", "Distributor"),
    "Kitchen Studio": ("kitchen-studio", "Kitchen studio"),
    "Interior Studio": ("interior-studio", "Interior studio"),
}
TYPE_RANK = {"distributor": 0, "kitchen-studio": 1, "interior-studio": 2, "dealer": 3}

# Bengaluru localities: canonical name -> aliases matched in addresses and
# searches. Used for the area of each outlet and the area search.
BLR_LOCALITIES: dict[str, list[str]] = {
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
    # "Pattom P.O., Thiruvananthapuram" in the sheet.
    "HOME & KITCHEN": "Pattom",
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

# Area spellings in the sheets -> the usual one.
AREA_SPELLING = {
    "dunkanroad": "Duncan Road", "andhrieast": "Andheri East", "vikroli": "Vikhroli",
    "borivili": "Borivali", "boriviliwest": "Borivali West", "kandivili": "Kandivali",
    "kandiviliwest": "Kandivali West", "sewree": "Sewri", "kavurihills": "Kavuri Hills",
    "jubleehills": "Jubilee Hills", "bachupally": "Bachupally", "srinagarcolony": "Srinagar Colony",
    "paradise": "Paradise, Secunderabad", "bandlaguda": "Bandlaguda", "cherlapally": "Cherlapally",
    "lowerparelwest": "Lower Parel", "thanewest": "Thane West", "kalyanwest": "Kalyan West",
    "vasaieast": "Vasai East", "jlplroad": "JLPL Industrial Area", "banjarahills": "Banjara Hills",
}
# Values in an area column that are not an area at all.
NOT_AN_AREA = {"100ft", "100ftroad", "none", ""}

# Bengaluru PIN codes the search knows even with no outlet in them.
BLR_PIN_CODES = [f"560{n:03d}" for n in range(1, 118)] + [
    "560300", "562106", "562107", "562110", "562114", "562123", "562125",
    "562129", "562130", "562149", "562157", "562162",
]

# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------


def squash(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]", "", s.lower())


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")


def km(a: tuple[float, float], b: tuple[float, float]) -> float:
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))


SMALL_WORDS = {"and", "of", "the", "n", "de", "di", "da"}
KEEP_UPPER = {"JB", "JD", "MK", "HHYS", "LLP", "UK", "NCR", "TAS", "SV", "SR", "KR", "RR", "AV", "BMR", "GK", "SS", "VK", "MG", "HSR", "BTM", "OMR", "ECR", "GST"}


def nice_case(s: str) -> str:
    """Capitals and all-lower text in title case; mixed case left alone."""
    s = re.sub(r"\s+", " ", (s or "").strip())
    letters = [c for c in s if c.isalpha()]
    if not letters:
        return s
    if not (all(c.isupper() for c in letters) or all(c.islower() for c in letters)):
        return s
    out = []
    for i, w in enumerate(s.split(" ")):
        core = re.sub(r"[^A-Za-z]", "", w)
        if core.upper() in KEEP_UPPER or (core and len(core) <= 5 and not re.search(r"[AEIOUYaeiouy]", core)):
            out.append(w.upper())
        elif i and core.lower() in SMALL_WORDS:
            out.append(w.lower())
        else:
            out.append(re.sub(r"[A-Za-z]+", lambda m: m.group(0)[0].upper() + m.group(0)[1:].lower(), w, count=0))
    return " ".join(out)


cache: dict[str, object] = json.loads(CACHE_PATH.read_text("utf-8")) if CACHE_PATH.exists() else {}
_last_call = [0.0]
_dirty = [0]


def save_cache(force: bool = False) -> None:
    _dirty[0] += 1
    if not force and _dirty[0] % 10:
        return
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
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                data = json.loads(r.read().decode("utf-8"))
            break
        except (urllib.error.URLError, TimeoutError) as e:
            if attempt == 2:
                print(f"  ! nominatim failed: {url} ({e})")
                return None
            time.sleep(3)
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
    except (urllib.error.URLError, TimeoutError) as e:
        print(f"  ! link failed: {url} ({e})")
        return None
    cache[key] = target
    save_cache()
    return target


def coords_from_maps_url(u: str) -> tuple[float, float] | None:
    m = re.search(r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)", u)
    if not m:
        m = re.search(r"@(-?\d+\.\d+),(-?\d+\.\d+)", u)
    if not m:
        m = re.search(r"[?&](?:q|query|ll)=(-?\d+\.\d+),\s*(-?\d+\.\d+)", urllib.parse.unquote(u))
    if not m:
        return None
    return float(m.group(1)), float(m.group(2))


PIN_RE = re.compile(r"(?<![\d.])([1-8]\d{2})\s?(\d{3})(?![\d.])")


def find_pin(text: str, state: str | None = None) -> str | None:
    """The last PIN in an address (addresses run from the door out)."""
    prefixes = STATE_PINS.get(state or "", None)
    pins = ["".join(m) for m in PIN_RE.findall(text or "")]
    if prefixes:
        pins = [p for p in pins if p.startswith(prefixes)]
    return pins[-1] if pins else None


LANDMARK = re.compile(r"\b(opp(osite)?|near|nearby|behind|beside|before|after|below|above|next to)\b[^,]*,?", re.I)


def spaced(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode()
    return " " + re.sub(r"[^a-z0-9]+", " ", s.lower()).strip() + " "


def find_blr_locality(text: str) -> str | None:
    """The Bengaluru locality named LAST in an address, longest alias on a tie."""
    text = LANDMARK.sub("", text or "")
    sp, sq = spaced(text), squash(text)
    best: tuple[int, int, str] | None = None
    for name, aliases in BLR_LOCALITIES.items():
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


def listing_address(url: str | None, name: str, state: str | None) -> str | None:
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
    sn = squash(name)
    words = [squash(w) for w in name.split()]
    heads = [h for h in (words[0] if words else "", "".join(words[:2])) if len(h) >= 4]

    def is_name(p: str) -> bool:
        sp_ = squash(p)
        return len(sp_) > 3 and (sp_ in sn or sn in sp_ or any(sp_.startswith(h) for h in heads))

    parts = [p for p in parts if p and not is_name(p)]
    a = ", ".join(parts)
    return a if find_pin(a, state) else None


def listing_name(url: str | None) -> str | None:
    """The business name on a resolved Google Maps listing link."""
    if not url:
        return None
    m = re.search(r"/maps/place/([^/]+)/", urllib.parse.urlparse(url).path)
    if not m:
        return None
    return urllib.parse.unquote_plus(m.group(1)).split(",")[0].strip()


def geocode_address(addr: str, city: str, centre: tuple[float, float], reach: float) -> tuple[float, float] | None:
    """Nominatim on the address, then on it with the leading parts dropped one
    at a time (house numbers, buildings, landmarks), accepting a street-level
    or finer hit within reach of the city only."""
    a = re.sub(r"\b(opp(osite)?|near|nearby|behind|beside|before|after|below|above|next to)\b[^,]*,", "", addr, flags=re.I)
    a = re.sub(r"\b[0-9A-Z]{4}\+[0-9A-Z]{2,3}\b,?", "", a)  # plus codes
    parts = [p.strip() for p in a.split(",") if p.strip()]
    state = CITIES[city][0]
    for k in range(0, min(4, max(1, len(parts) - 2))):
        q = ", ".join(parts[k:])
        if squash(city) not in squash(q) and not any(squash(x) in squash(q) for x in CITIES[city][1]):
            q += f", {city}"
        if squash(state) not in squash(q):
            q += f", {state}"
        res = nominatim("search", {"q": q, "countrycodes": "in", "limit": 3})
        if isinstance(res, list):
            for r in res:
                p = (float(r["lat"]), float(r["lon"]))
                if km(p, centre) <= reach and int(r.get("place_rank", 0)) >= 26:
                    return p
    return None


def locality_of(addr: str, city: str, centre: tuple[float, float], reach: float):
    """The locality an address names, from its parts nearest the city end:
    a Nominatim place (suburb, town, village) within reach of the city."""
    parts = [p.strip() for p in re.split(r"[,\n]", addr) if p.strip()]
    state = CITIES[city][0]
    for part in reversed(parts):
        if re.search(r"\d|district|road|rd\b|street|floor|plot|survey|no\b", part, re.I) or len(part) < 4:
            continue
        if squash(part) in CITY_ALIAS or squash(part) == squash(state):
            continue
        res = nominatim("search", {"q": f"{part}, {state}", "countrycodes": "in", "limit": 3})
        if isinstance(res, list):
            for r in res:
                pt = (float(r["lat"]), float(r["lon"]))
                if km(pt, centre) <= reach and 12 <= int(r.get("place_rank", 0)) <= 25:
                    return nice_case(part), pt
    return None


def first_near(results: object, centre: tuple[float, float], reach: float) -> tuple[float, float] | None:
    if not isinstance(results, list):
        return None
    for r in results:
        p = (float(r["lat"]), float(r["lon"]))
        if km(p, centre) <= reach:
            return p
    return None


def clean_address(raw: str, name: str, city: str, recase: bool = True) -> str:
    a = str(raw or "")
    # Tax and registration lines in the distributor directory.
    a = re.sub(r"(GSTIN|GSTIN/UIN|PAN/IT No|PAN)\s*[:.]?\s*[\n ]*:?\s*[0-9A-Z]{10,15}", "", a, flags=re.I)
    a = re.sub(r"State\s*Name\s*[:.]?\s*[A-Za-z ]+,?\s*Code\s*:\s*\d+", "", a, flags=re.I)
    a = re.sub(r"State Code:\s*\d+,?", "", a, flags=re.I)
    a = re.sub(r"PIN Code:\s*", "", a, flags=re.I)
    a = re.sub(r"Branch \d+ \(([^)]*)\):", r"\1:", a)
    a = re.sub(r"\s*\n\s*", ", ", a)
    a = re.sub(r"\s+", " ", a).strip().strip(",")
    a = re.sub(r"(,\s*)+", ", ", a)
    if recase:
        a = nice_case(a)
    # The business's own name as a part of its address.
    sn = squash(name)
    a = ", ".join(x.strip() for x in a.split(",") if not (len(squash(x)) > 4 and (squash(x) == sn or (len(sn) > 6 and sn in squash(x) and len(squash(x)) < len(sn) + 6))))
    # A leading fragment of the business's own name ("lorzy Experience Centre, …").
    head = a.split(",")[0].strip()
    if head and len(head) > 4 and (squash(head) in squash(name) or squash(name).endswith(squash(head)) or squash(name) in squash(head)):
        a = a[len(a.split(",")[0]) + 1 :].strip()
    state = CITIES[city][0]
    # A stray partial PIN mid-address ("…, 39th Cross, 56004, 3rd Main Rd, …").
    a = re.sub(r",\s*[1-8]\d{4}\s*,", ",", a)
    # The tail: country, state, PIN and city, in whatever order the sheet has.
    tail_words = [state, "India"] + CITIES[city][1] + [city]
    for _ in range(4):
        before = a
        a = re.sub(r"[,\s–-]*\b[1-8]\d{2}\s?\d{3}\s*$", "", a)
        for w in tail_words:
            a = re.sub(rf"[,\s–-]*\b{re.escape(w)}\b\.?\s*$", "", a, flags=re.I)
        if a == before:
            break
    return a.strip().strip(",").strip()


def phone_obj(raw: str) -> dict | None:
    first = re.split(r"[/,;]", str(raw))[0]
    digits = re.sub(r"\D", "", first)
    if digits.startswith("91") and len(digits) == 12:
        n = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):  # 080 xxxx xxxx
        n = digits[1:]
    elif len(digits) == 10:
        n = digits
    else:
        return None
    if n.startswith("80"):  # Bengaluru landline, 080 xxxx xxxx
        display = f"+91 80 {n[2:6]} {n[6:]}"
    else:
        display = f"+91 {n[:5]} {n[5:]}"
    return {"display": display, "href": f"tel:+91{n}"}


SANITY_QUERY_URL = "https://zg1p4qgs.api.sanity.io/v2026-03-28/data/query/production"


def sanity_read_token() -> str:
    import os

    env = dict(os.environ)
    local = ROOT / ".env.local"
    if local.exists():
        for line in local.read_text(encoding="utf-8").splitlines():
            k, sep, v = line.partition("=")
            if sep and k.strip() and not k.lstrip().startswith("#"):
                env.setdefault(k.strip(), v.strip().strip('"'))
    return (env.get("SANITY_API_READ_TOKEN") or env.get("SANITY_API_WRITE_TOKEN") or "").strip()


def sanity_phones() -> dict[str, dict]:
    """Public phone numbers of the Sanity `dealer` documents, by squashed name."""
    q = '*[_type=="dealer" && defined(phone)]{name, phone}'
    key = "sanity:" + q
    if key not in cache:
        if OFFLINE:
            return {}
        url = SANITY_QUERY_URL + "?" + urllib.parse.urlencode({"query": q, "perspective": "published"})
        headers = {"User-Agent": UA}
        token = sanity_read_token()
        if token:
            headers["Authorization"] = f"Bearer {token}"
        with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as resp:
            cache[key] = json.load(resp)["result"]
        save_cache(True)
    out = {}
    for row in cache[key]:
        ph = phone_obj(row.get("phone") or "")
        if ph and row.get("name"):
            out[squash(row["name"])] = ph
    return out


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


def to_city(raw: str | None, fallback: str | None = None) -> str | None:
    s = squash(raw or "")
    if s in CITY_ALIAS:
        return CITY_ALIAS[s]
    # The town named first (addresses run from the door out to the district).
    hits = [(s.find(k), -len(k), c) for k, c in CITY_ALIAS.items() if len(k) >= 5 and k in s]
    return min(hits)[2] if hits else fallback


def area_from_sheet(raw: str | None, city: str) -> str | None:
    s = squash(raw or "")
    if s in NOT_AN_AREA:
        return None
    if s in AREA_SPELLING:
        return AREA_SPELLING[s]
    if to_city(raw) == city and s in CITY_ALIAS:
        return None  # the column names only the city
    return nice_case(str(raw).strip())


def yes(v) -> bool:
    return str(v or "").strip().lower().startswith("yes")


def link_of(cell) -> str | None:
    """A Google Maps link in a cell: its hyperlink, or a URL typed in it."""
    if cell.hyperlink and cell.hyperlink.target:
        return cell.hyperlink.target
    m = re.search(r"https?://\S+", str(cell.value or ""))
    return m.group(0).rstrip(")") if m else None


def header(ws, must: str):
    for r in range(1, 10):
        names = {str(ws.cell(r, c).value).strip(): c for c in range(1, ws.max_column + 1) if ws.cell(r, c).value}
        if must in names:
            return r, names
    raise SystemExit(f"{ws.title}: no '{must}' header")


# --------------------------------------------------------------------------
# Reading the tabs: one plain record per row, public fields only
# --------------------------------------------------------------------------


def rec(**k) -> dict:
    base = dict(
        name="", kind="dealer", city=None, raw_address="", area=None, links=[],
        samples=False, slabs=False, colours=[], phone=None, tab="", pin=None,
        link_is_pin=True,
    )
    base.update(k)
    return base


def read_karnataka(ws, excluded) -> list[dict]:
    hr, col = header(ws, "Partner Name")

    def cell(r, n):
        return ws.cell(r, col[n]).value if n in col else None

    rows = [r for r in range(hr + 1, ws.max_row + 1) if cell(r, "Partner Name")]
    by_name = {str(cell(r, "Partner Name")).strip(): r for r in rows}
    out = []
    for r in rows:
        name = str(cell(r, "Partner Name")).strip()
        status = str(cell(r, "Stand Status") or "").strip()
        city = to_city(cell(r, "City")) or to_city(cell(r, "Address / Area")) or to_city(cell(r, "Location (display list)"))
        if status in EXCLUDE_STATUS:
            excluded.append((name, "Karnataka", f"stand status '{status}' (no Pacific display there now)"))
            continue
        if name in EXCLUDE_NAMES:
            excluded.append((name, "Karnataka", EXCLUDE_NAMES[name]))
            continue
        if not city:
            # The display list names only the area: those are Bengaluru areas.
            city = "Bengaluru" if cell(r, "Location (display list)") else None
        if not city:
            excluded.append((name, "Karnataka", "no city in the sheet"))
            continue
        links, pinned = [], True
        gm = ws.cell(r, col["Google Maps"])
        l1 = link_of(gm)
        if l1:
            links.append(l1)
            pinned = str(cell(r, "Map Link Type") or "").strip() == "Pinned link"
        if "Map Link (display list, if different)" in col:
            l2 = link_of(ws.cell(r, col["Map Link (display list, if different)"]))
            if l2:
                links.insert(0, l2)
                pinned = True
        phone = None
        if str(cell(r, "Phone Source") or "").startswith("Google") and cell(r, "POC Phone (91XXXXXXXXXX)"):
            phone = phone_obj(cell(r, "POC Phone (91XXXXXXXXXX)"))
        if phone is None and name in MERGE_PHONE_FROM:
            other = by_name.get(MERGE_PHONE_FROM[name])
            if other and str(cell(other, "Phone Source") or "").startswith("Google"):
                phone = phone_obj(cell(other, "POC Phone (91XXXXXXXXXX)"))
        old = cell(r, "Old Stands at Site (Qty)") or 0
        placed = cell(r, "New Stands Placed") or 0
        try:
            old, placed = float(old), float(placed)
        except (TypeError, ValueError):
            old, placed = 0, 0
        withdrawal = str(cell(r, "Old Stand Withdrawal") or "")
        samples = placed > 0 or (old > 0 and "Empty" not in withdrawal and withdrawal != "Withdrawn")
        details = " ".join(str(cell(r, n) or "") for n in ("Display / Wall Details", "Display Slabs (display list)"))
        colours = on_display(details)
        slabs = bool(re.search(r"Display (slab|wall)", details, re.I)) or status == "Display Only (No Stand)"
        kind = TYPES.get(str(cell(r, "Category") or "").strip(), ("dealer", "Dealer"))[0]
        out.append(rec(
            name=name, kind=kind, city=city, tab="Karnataka",
            raw_address=str(cell(r, "Address / Area") or "").strip(),
            area_hint=str(cell(r, "Location (display list)") or ""),
            links=links, link_is_pin=pinned, samples=bool(samples), slabs=slabs,
            colours=colours, phone=phone,
        ))
    return out


def read_mumbai(ws, excluded) -> list[dict]:
    hr, col = header(ws, "FIRM NAME")
    kinds = {"dealer": "dealer", "kitchen": "kitchen-studio"}
    out = []
    for r in range(hr + 1, ws.max_row + 1):
        name = ws.cell(r, col["FIRM NAME"]).value
        if not name:
            continue
        name = str(name).strip()
        cat = str(ws.cell(r, col["Dealer/Architect/Builder/Kitchen"]).value or "").strip().lower()
        if cat not in kinds:
            excluded.append((name, "Mumbai", f"listed as '{cat or 'blank'}', not an outlet"))
            continue
        addr = str(ws.cell(r, col["ADDRESS"]).value or "")
        loc = ws.cell(r, col["LOCATION"]).value
        city = to_city(loc) if to_city(loc) in ("Thane", "Kalyan", "Vasai", "Navi Mumbai") else None
        city = city or "Mumbai"
        samples = any(yes(ws.cell(r, col[c]).value) for c in ("Stand /Trolly (28 Pic)", "Loose trolly samples", "Sample kit (5*10)", "Sample kit (3.5*7)"))
        out.append(rec(name=name, kind=kinds[cat], city=city, tab="Mumbai", raw_address=addr,
                       area_hint=str(loc or ""), samples=samples))
    return out


def read_pune(ws, excluded) -> list[dict]:
    hr, col = header(ws, "Company Name")
    out = []
    for r in range(hr + 1, ws.max_row + 1):
        name = ws.cell(r, col["Company Name"]).value
        if not name:
            continue
        brand = str(ws.cell(r, col["Branding Type"]).value or "")
        link = link_of(ws.cell(r, col["Google Maps"]))
        out.append(rec(name=str(name).strip(), city="Pune", tab="Pune",
                       raw_address=str(ws.cell(r, col["Address"]).value or ""),
                       links=[link] if link else [], samples="sample" in brand.lower()))
    return out


def read_hyderabad(ws, excluded, kitchen: bool) -> list[dict]:
    hr, col = header(ws, "DEALER FIRM")
    out = []
    for r in range(hr + 1, ws.max_row + 1):
        name = ws.cell(r, col["DEALER FIRM"]).value
        if not name:
            continue
        name = str(name).strip()
        place = str(ws.cell(r, col["PLACE"]).value or "")
        viva = str(ws.cell(r, col["VIVA"]).value or "").strip().lower()
        stand = str(ws.cell(r, col["STAND"]).value or "").strip().lower() if "STAND" in col else ""
        if kitchen and viva == "will decide":
            excluded.append((name, "Hyderabad Top 22", "still deciding (no Pacific material there yet)"))
            continue
        gm = ws.cell(r, col["Google Maps"])
        link = link_of(gm)
        typed = str(gm.value or "")
        addr = typed.split("[")[0].strip() if not link and len(typed) > 30 else ""
        out.append(rec(name=name, kind="kitchen-studio" if kitchen else "dealer",
                       city=to_city(place, "Hyderabad"), tab="Hyderabad" + (" Top 22" if kitchen else ""),
                       raw_address=addr, area_hint=place, links=[link] if link else [],
                       samples=(stand == "sent") or viva in ("stand", "binders", "already having")))
    return out


def read_kerala_contacts(ws, excluded) -> list[dict]:
    hr, col = header(ws, "DEALER NAME")
    out = []
    for r in range(hr + 1, ws.max_row + 1):
        name = ws.cell(r, col["DEALER NAME"]).value
        if not name:
            continue
        link = link_of(ws.cell(r, col["Google Maps"]))
        out.append(rec(name=str(name).strip(), city=to_city(ws.cell(r, col["CITY"]).value), tab="Kerala Contacts",
                       raw_address=str(ws.cell(r, col["ADDRESS"]).value or ""), links=[link] if link else []))
    return out


def read_kerala_regions(ws, excluded) -> list[dict]:
    hr, col = header(ws, "REGION")
    name_c = next(c for n, c in col.items() if n.startswith("DEALER"))
    place_c = next(c for n, c in col.items() if n.startswith("PALCE") or n.startswith("PLACE"))
    wall_c = next(c for n, c in col.items() if n.startswith("WALL"))
    stand_c = next(c for n, c in col.items() if n.startswith("STAND"))
    out = []
    for r in range(hr + 1, ws.max_row + 1):
        name = ws.cell(r, name_c).value
        if not name:
            continue
        gm = ws.cell(r, col["Google Maps"])
        link = link_of(gm)
        typed = str(gm.value or "")
        addr = typed.split("[")[0].strip(" ,") if not link and len(typed) > 30 else ""
        cat = str(ws.cell(r, col["CATEGORY"]).value or "").lower()
        out.append(rec(name=str(name).strip(), kind="kitchen-studio" if "kitchen" in cat else "dealer",
                       city=to_city(ws.cell(r, place_c).value), tab="Kerala Regions", raw_address=addr,
                       links=[link] if link else [],
                       samples=yes(ws.cell(r, stand_c).value) or yes(ws.cell(r, col["BOX"]).value),
                       slabs=yes(ws.cell(r, wall_c).value)))
    return out


def read_punjab(ws, excluded) -> list[dict]:
    hr, col = header(ws, "Firm")
    out = []
    for r in range(hr + 1, ws.max_row + 1):
        name = ws.cell(r, col["Firm"]).value
        if not name:
            continue
        loc = ws.cell(r, col["Location"]).value
        link = link_of(ws.cell(r, col["Address"]))
        status = str(ws.cell(r, col["Status"]).value or "").strip().lower()
        out.append(rec(name=str(name).strip(), city=to_city(loc) or ("Mohali" if "jlpl" in squash(loc) else None),
                       tab="Punjab", area_hint=str(loc or "") if "jlpl" in squash(loc) else "",
                       links=[link] if link else [], samples=status == "done"))
    return out


def read_links_only(ws, excluded, city: str, link_col: str) -> list[dict]:
    hr, col = header(ws, "Firm")
    out = []
    for r in range(hr + 1, ws.max_row + 1):
        name = ws.cell(r, col["Firm"]).value
        if not name:
            continue
        link = link_of(ws.cell(r, col[link_col]))
        brand = str(ws.cell(r, col["Branding"]).value or "").lower()
        out.append(rec(name=str(name).strip(), city=city, tab=ws.title, links=[link] if link else [],
                       samples=any(w in brand for w in ("stand", "sample", "box")),
                       slabs=any(w in brand for w in ("table", "vanit"))))
    return out


def read_tamil_nadu(ws, excluded) -> list[dict]:
    hr, col = header(ws, "Dealer")
    out = []
    for r in range(hr + 1, ws.max_row + 1):
        name = ws.cell(r, col["Dealer"]).value
        if not name:
            continue
        out.append(rec(name=str(name).strip(), city=to_city(ws.cell(r, col["Region"]).value), tab="Tamil Nadu",
                       raw_address=str(ws.cell(r, col["Address"]).value or ""),
                       samples=yes(ws.cell(r, col["Sample Stand"]).value) or yes(ws.cell(r, col["Sample Box"]).value),
                       slabs=yes(ws.cell(r, col["Display"]).value)))
    return out


def read_distributors(ws, excluded) -> list[dict]:
    hr, col = header(ws, "Distributor Name")
    out = []
    for r in range(hr + 1, ws.max_row + 1):
        name = ws.cell(r, col["Distributor Name"]).value
        if not name:
            continue
        name = str(name).strip()
        status = str(ws.cell(r, col["Status"]).value or "").strip()
        if status.lower() == "inactive":
            excluded.append((name, "Distributors", "status Inactive"))
            continue
        addr = str(ws.cell(r, col["Address"]).value or "")
        if addr.startswith("Branch 1"):
            addr = addr.split("\n")[0]
        city = to_city(ws.cell(r, col["Location"]).value) or to_city(addr)
        out.append(rec(name=name, kind="distributor", city=city, tab="Distributors", raw_address=addr))
    return out


# --------------------------------------------------------------------------


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit(__doc__)
    wb = openpyxl.load_workbook(args[0])
    excluded: list[tuple[str, str, str]] = []

    raw: list[dict] = []
    raw += read_distributors(wb["Distributors"], excluded)
    raw += read_karnataka(wb["Karnataka"], excluded)
    raw += read_mumbai(wb["Mumbai"], excluded)
    raw += read_pune(wb["Pune"], excluded)
    raw += read_hyderabad(wb["Hyderabad Top 22"], excluded, kitchen=True)
    raw += read_hyderabad(wb["Hyderabad"], excluded, kitchen=False)
    raw += read_kerala_regions(wb["Kerala Regions"], excluded)
    raw += read_kerala_contacts(wb["Kerala Contacts"], excluded)
    raw += read_punjab(wb["Punjab"], excluded)
    raw += read_links_only(wb["Delhi"], excluded, "Delhi", "Map Link")
    raw += read_links_only(wb["Kolkata"], excluded, "Kolkata", "Place")
    raw += read_tamil_nadu(wb["Tamil Nadu"], excluded)

    # --- the same business twice (two tabs, or a repeat in one): merged
    merged: dict[tuple[str, str], dict] = {}
    order: list[tuple[str, str]] = []
    for r in raw:
        if not r["city"]:
            excluded.append((r["name"], r["tab"], "no city we can place"))
            continue
        canon = SAME_AS.get(r["name"], r["name"])
        key = (squash(NAME_FIXES.get(canon, canon)), r["city"])
        if key not in merged:
            merged[key] = dict(r, name=canon, tabs=[r["tab"]])
            order.append(key)
            continue
        m = merged[key]
        m["tabs"].append(r["tab"])
        if TYPE_RANK[r["kind"]] < TYPE_RANK[m["kind"]]:
            m["kind"] = r["kind"]
        m["samples"] |= r["samples"]
        m["slabs"] |= r["slabs"]
        m["colours"] += [c for c in r["colours"] if c not in m["colours"]]
        m["links"] += [l for l in r["links"] if l not in m["links"]]
        if len(squash(r["raw_address"])) > len(squash(m["raw_address"])):
            m["raw_address"] = r["raw_address"]
        m["phone"] = m["phone"] or r["phone"]
        if not m.get("area_hint") and r.get("area_hint"):
            m["area_hint"] = r["area_hint"]

    centres: dict[str, tuple[float, float]] = {}

    def centre(city: str) -> tuple[float, float] | None:
        if city in centres:
            return centres[city]
        state = CITIES[city][0]
        res = nominatim("search", {"q": f"{city}, {state}, India", "countrycodes": "in", "limit": 1})
        if isinstance(res, list) and res:
            centres[city] = (float(res[0]["lat"]), float(res[0]["lon"]))
            return centres[city]
        return None

    dealers, unclear = [], []
    notes_out: dict[str, list[str]] = {}
    for key in order:
        r = merged[key]
        name, city = r["name"], r["city"]
        state = CITIES[city][0]
        reach = CITIES[city][2]
        c0 = centre(city)
        if not c0:
            excluded.append((name, r["tab"], f"could not place the city '{city}'"))
            continue
        notes: list[str] = []
        if len(r["tabs"]) > 1:
            notes.append("merged from " + " + ".join(r["tabs"]))

        # --- the team's map link: the outlet's own listing
        target = None
        for link in r["links"]:
            if "goo.gl" in link or "maps.app" in link:
                t = resolve_short_link(link)
            else:
                t = link if "google." in link else None
            if t:
                target = t
                break
        lat = lng = None
        geo = None
        c = coords_from_maps_url(target or "") if r["link_is_pin"] else None
        if c and km(c, c0) <= reach * 1.5:
            lat, lng = c
            geo = "pin"
        elif c:
            notes.append(f"map link is {km(c, c0):.0f} km from {city}; not used")
        if target and not listing_name(target) and geo is None and r["links"]:
            notes.append("map link is not a business listing")

        # --- the address: the sheet's, else the outlet's Google Maps listing
        addr_src = ADDRESS_OVERRIDES.get(name) or r["raw_address"]
        if squash(addr_src) == squash(name):
            addr_src = ""
        full = bool(addr_src) and (find_pin(addr_src, state) is not None or addr_src.count(",") >= 2)
        if not full:
            listed = listing_address(target, name, state)
            if listed:
                addr_src, full = listed, True
                notes.append("address from the outlet's Google Maps listing")
        pin = PIN_OVERRIDES.get(name) or find_pin(addr_src, state)

        # --- area
        area = AREA_OVERRIDES.get(name)
        if not area and city == "Bengaluru":
            area = find_blr_locality(addr_src) or find_blr_locality(r["raw_address"]) or find_blr_locality(r.get("area_hint", ""))
        if not area:
            area = area_from_sheet(r.get("area_hint"), city)

        if geo is None and full:
            hit = geocode_address(addr_src, city, c0, reach)
            if hit:
                lat, lng = hit
                geo = "address"
        if geo is None and full and not area:
            loc = locality_of(addr_src, city, c0, reach)
            if loc:
                area, (lat, lng) = loc[0], loc[1]
                geo = "area"
                notes.append(f"located at the locality '{area}' named in the address")
        if geo is None and area:
            hit = first_near(nominatim("search", {"q": f"{area}, {city}, {state}", "countrycodes": "in", "limit": 3}), c0, reach)
            if hit:
                lat, lng = hit
                geo = "area"
        if geo is None and pin:
            hit = first_near(nominatim("search", {"postalcode": pin, "country": "in", "limit": 3}), c0, reach)
            if hit:
                lat, lng = hit
                geo = "pin-code"
        if geo is None and city not in METROS:
            lat, lng = c0
            geo = "area"
            notes.append(f"located at the centre of {city} (no address or map link)")
        if geo is None:
            excluded.append((name, "+".join(r["tabs"]), f"no usable location in {city} (no map link, address, area or PIN)"))
            continue

        # --- PIN and area from the map pin, never from an area's centre
        if (not pin or not area) and geo in ("pin", "address"):
            rev = nominatim("reverse", {"lat": f"{lat:.6f}", "lon": f"{lng:.6f}", "zoom": 16, "addressdetails": 1})
            ad = (rev or {}).get("address", {}) if isinstance(rev, dict) else {}
            if not pin and ad.get("postcode"):
                p = re.sub(r"\D", "", ad["postcode"])[:6]
                if len(p) == 6 and p.startswith(STATE_PINS.get(state, ("",))):
                    pin = p
                    notes.append("PIN from the map pin's location")
            if not area:
                if city == "Bengaluru":
                    guess = " ".join(str(ad.get(k, "")) for k in ("suburb", "neighbourhood", "city_district", "village", "town"))
                    area = find_blr_locality(guess)
                area = area or ad.get("suburb") or ad.get("neighbourhood") or ad.get("city_district") or None
                if area and squash(area) in CITY_ALIAS:
                    area = None
                if area:
                    notes.append("area from the map pin's location")
        if not area:
            area = city

        address = clean_address(addr_src, name, city, recase="Karnataka" not in r["tabs"]) if full else ""
        if not full or "address from the outlet's Google Maps listing" in notes:
            unclear.append((name, city, r["raw_address"] or "(blank)", geo, address))

        shown = published_name(name, "Karnataka" in r["tabs"])
        if notes:
            notes_out[f"{shown} ({city})"] = notes
        dealers.append({
            "id": slug(shown),
            "name": shown,
            "type": r["kind"],
            "typeLabel": next(v[1] for v in TYPES.values() if v[0] == r["kind"]),
            "address": address,
            "area": area,
            "pin": pin or "",
            "city": city,
            "state": state,
            "phone": r["phone"],
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "geo": geo,
            "samples": bool(r["samples"]),
            "slabs": bool(r["slabs"]),
            "onDisplay": r["colours"],
        })

    # Ids: a name in two cities gets its city added.
    seen: dict[str, int] = {}
    for d in dealers:
        seen[d["id"]] = seen.get(d["id"], 0) + 1
    for d in dealers:
        if seen[d["id"]] > 1 and d["city"] != "Bengaluru":
            d["id"] = slug(f"{d['name']} {d['city']}")

    # Outlets on the same approximate point would stack into one marker:
    # fan them out ~240 m so each can be clicked.
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

    from_sanity = sanity_phones()
    for d in dealers:
        if d["phone"] is None:
            d["phone"] = from_sanity.get(squash(d["name"]))

    dealers.sort(key=lambda d: (d["city"] != "Bengaluru", d["city"], d["name"].lower()))
    ids = [d["id"] for d in dealers]
    assert len(ids) == len(set(ids)), "duplicate ids"

    # --- places: PIN centres, cities and localities
    pins: dict[str, list[float]] = {}
    want: dict[str, str] = {p: "Bengaluru" for p in BLR_PIN_CODES}
    for d in dealers:
        if d["pin"]:
            want.setdefault(d["pin"], d["city"])
    for p, city in sorted(want.items()):
        c0 = centre(city)
        hit = first_near(nominatim("search", {"postalcode": p, "country": "in", "limit": 3}), c0, CITIES[city][2] * 1.5) if c0 else None
        if hit:
            pins[p] = [round(hit[0], 5), round(hit[1], 5)]

    places = []
    for city in sorted({d["city"] for d in dealers}):
        c0 = centre(city)
        places.append({"name": city, "aliases": CITIES[city][1], "city": city, "state": CITIES[city][0],
                       "kind": "city", "lat": round(c0[0], 5), "lng": round(c0[1], 5)})
    for name, aliases in BLR_LOCALITIES.items():
        hit = first_near(nominatim("search", {"q": f"{name}, Bengaluru, Karnataka", "countrycodes": "in", "limit": 3}), centre("Bengaluru"), 45)
        if hit:
            places.append({"name": name, "aliases": aliases, "city": "Bengaluru", "state": "Karnataka",
                           "kind": "area", "lat": round(hit[0], 5), "lng": round(hit[1], 5)})
    known = {(p["name"], p["city"]) for p in places}
    for area, city in sorted({(d["area"], d["city"]) for d in dealers if d["area"] != d["city"]} - known):
        c0 = centre(city)
        hit = first_near(nominatim("search", {"q": f"{area}, {city}, {CITIES[city][0]}", "countrycodes": "in", "limit": 3}), c0, CITIES[city][2])
        if not hit:  # the mean of its outlets
            pts = [(d["lat"], d["lng"]) for d in dealers if d["area"] == area and d["city"] == city]
            hit = (sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))
        places.append({"name": area, "aliases": [area], "city": city, "state": CITIES[city][0],
                       "kind": "area", "lat": round(hit[0], 5), "lng": round(hit[1], 5)})
    save_cache(True)

    stamp = date.today().isoformat()
    OUT_DEALERS.write_text(json.dumps({
        "generated": stamp,
        "source": "All-regions dealer and distributor master (internal); public business details only. Regenerate with scripts/build-dealers-india.py.",
        "dealers": dealers,
    }, indent=2, ensure_ascii=False) + "\n", "utf-8")
    OUT_PLACES.write_text(json.dumps({
        "generated": stamp,
        "source": "OpenStreetMap Nominatim (© OpenStreetMap contributors, ODbL): city, locality and PIN-code centres.",
        "pins": pins,
        "places": places,
    }, indent=1, ensure_ascii=False) + "\n", "utf-8")

    by_city: dict[str, int] = {}
    for d in dealers:
        by_city[d["city"]] = by_city.get(d["city"], 0) + 1
    print(f"\nIncluded {len(dealers)} outlets -> {OUT_DEALERS.relative_to(ROOT)}")
    for c, n in sorted(by_city.items(), key=lambda x: -x[1]):
        print(f"  {c:<20} {n}")
    geo_n: dict[str, int] = {}
    for d in dealers:
        geo_n[d["geo"]] = geo_n.get(d["geo"], 0) + 1
    print(f"  located by: {geo_n}")
    print(f"  with samples or slabs on show: {sum(1 for d in dealers if d['samples'] or d['slabs'])}")
    print("\nOUTLETS")
    for d in dealers:
        print(f"  + {d['city']:<14} {d['name']:<44} {d['typeLabel']:<15} {d['area'][:22]:<22} {d['pin'] or '------'} geo={d['geo']:<8} {'S' if d['samples'] else '-'}{'L' if d['slabs'] else '-'} {'ph' if d['phone'] else ''}")
    print(f"\nExcluded {len(excluded)}:")
    for n, tab, why in excluded:
        print(f"  - [{tab}] {n}: {why}")
    print(f"\nAddress unclear {len(unclear)}:")
    for n, city, rw, g, a in unclear:
        print(f"  ? {n} ({city}): sheet '{rw[:60]}' -> published '{a or '(area only)'}' (located by {g})")
    print(f"\nBuild notes (not published) {len(notes_out)}:")
    for n, ns in notes_out.items():
        print(f"  * {n}: {'; '.join(ns)}")
    print(f"\nPlaces: {len(pins)} PIN centres, {len(places)} cities and localities -> {OUT_PLACES.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
