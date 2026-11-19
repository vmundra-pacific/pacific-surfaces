"""
Polish postal codes to map positions, for the Poland "nearest distributor"
finder on Where to Buy (owner, 2026-11-19).

Source: GeoNames postal code dump for Poland,
https://download.geonames.org/export/zip/PL.zip (PL.txt), licensed under
Creative Commons Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/);
credit to GeoNames (www.geonames.org) is shown on the finder's map.

Each postal code covers one or more places; its position here is the mean
of their coordinates, to two decimals (about 1 km), which is plenty for
finding the nearest of a handful of distributors.

    curl -sSO https://download.geonames.org/export/zip/PL.zip
    unzip -o PL.zip PL.txt
    python3 scripts/build-poland-postcodes.py PL.txt

Writes src/data/poland-postcodes.json: {"generated": "...", "source": "...",
"codes": {"42130": [50.85, 18.97], ...}} keyed by the five digits.
"""
import csv
import datetime
import json
import sys
from collections import defaultdict

src = sys.argv[1] if len(sys.argv) > 1 else "PL.txt"
acc = defaultdict(lambda: [0.0, 0.0, 0])
with open(src, encoding="utf-8") as f:
    for row in csv.reader(f, delimiter="\t"):
        if len(row) < 11 or row[0] != "PL":
            continue
        code = row[1].replace("-", "").strip()
        if len(code) != 5 or not code.isdigit():
            continue
        try:
            lat, lng = float(row[9]), float(row[10])
        except ValueError:
            continue
        a = acc[code]
        a[0] += lat
        a[1] += lng
        a[2] += 1

codes = {
    c: [round(a[0] / a[2], 2), round(a[1] / a[2], 2)]
    for c, a in sorted(acc.items())
}
out = {
    "generated": datetime.date.today().isoformat(),
    "source": "GeoNames postal codes, Poland (CC BY 4.0, www.geonames.org)",
    "codes": codes,
}
path = "src/data/poland-postcodes.json"
with open(path, "w", encoding="utf-8") as f:
    json.dump(out, f, separators=(",", ":"))
    f.write("\n")
print(f"{len(codes)} postal codes written to {path}")
