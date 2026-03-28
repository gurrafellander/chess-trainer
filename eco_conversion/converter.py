"""
Chess Openings Data Pipeline
============================
Converts lichess-org/chess-openings TSV files into a structured JSON file
where each opening family has a curated list of 10-30 variations (PGN).

Usage:
    pip install requests
    python build_openings.py

Output:
    openings.json — grouped by opening family, each with a list of variations
"""

import csv
import json
import re
import io
from collections import defaultdict
from urllib.request import urlopen

# ── Config ────────────────────────────────────────────────────────────────────

TSV_URLS = [
    "https://raw.githubusercontent.com/lichess-org/chess-openings/master/a.tsv",
    "https://raw.githubusercontent.com/lichess-org/chess-openings/master/b.tsv",
    "https://raw.githubusercontent.com/lichess-org/chess-openings/master/c.tsv",
    "https://raw.githubusercontent.com/lichess-org/chess-openings/master/d.tsv",
    "https://raw.githubusercontent.com/lichess-org/chess-openings/master/e.tsv",
]

MIN_VARIATIONS = 10  # min variations to include a family at all
MAX_VARIATIONS = 30  # cap per opening family
MIN_MOVES = 4  # skip ultra-short lines (less interesting for teaching)
OUTPUT_FILE = "openings.json"

# ── Step 1: Load all TSV rows ─────────────────────────────────────────────────


def fetch_tsv(url: str) -> list[dict]:
    print(f"Fetching {url} ...")
    with urlopen(url) as r:
        content = r.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content), delimiter="\t")
    return list(reader)


def load_all_rows() -> list[dict]:
    rows = []
    for url in TSV_URLS:
        rows.extend(fetch_tsv(url))
    print(f"  → Loaded {len(rows)} total variations")
    return rows


# ── Step 2: Parse names into family / variation ────────────────────────────────


def parse_name(name: str) -> tuple[str, str]:
    """
    'Sicilian Defense: Najdorf Variation, English Attack'
     → family='Sicilian Defense', variation='Najdorf Variation, English Attack'

    'King's Pawn Opening'
     → family="King's Pawn Opening", variation=''
    """
    if ":" in name:
        family, _, variation = name.partition(":")
        return family.strip(), variation.strip()
    return name.strip(), ""


# ── Step 3: Count moves in a PGN string ──────────────────────────────────────


def count_moves(pgn: str) -> int:
    """Count half-moves (plies) in a PGN string like '1. e4 c5 2. Nf3'."""
    # Remove move numbers (e.g. "1.", "2.") and count remaining tokens
    tokens = re.sub(r"\d+\.", "", pgn).split()
    return len(tokens)


# ── Step 4: Remove prefix variations ─────────────────────────────────────────


def normalize_moves(pgn: str) -> str:
    """Strip move numbers so '1. e4 c5 2. Nf3' → 'e4 c5 Nf3' for prefix checks."""
    return " ".join(re.sub(r"\d+\.", "", pgn).split())


def remove_prefixes(variations: list[dict]) -> list[dict]:
    """
    Keep only 'leaf' variations — those whose move sequence is NOT a strict
    prefix of any other variation in the same family. This avoids teaching
    e.g. '1. e4 c5' when '1. e4 c5 2. Nf3 Nc6 3. d4' is also present.
    """
    move_strs = [normalize_moves(v["pgn"]) for v in variations]

    keepers = []
    for i, moves_i in enumerate(move_strs):
        is_prefix = False
        for j, moves_j in enumerate(move_strs):
            if i == j:
                continue
            # i is a strict prefix of j if j starts with i followed by a space
            if moves_j.startswith(moves_i + " ") or moves_j == moves_i:
                if len(moves_j) > len(moves_i):
                    is_prefix = True
                    break
        if not is_prefix:
            keepers.append(variations[i])

    return keepers


# ── Step 5: Select best variations per family ─────────────────────────────────


def select_variations(
    variations: list[dict], max_n: int = MAX_VARIATIONS
) -> list[dict]:
    """
    After removing prefixes, sort by move depth descending (deepest = most
    specific variation, best for teaching), then cap at max_n.
    """
    sorted_vars = sorted(variations, key=lambda v: count_moves(v["pgn"]), reverse=True)
    return sorted_vars[:max_n]


# ── Step 6: Build the output structure ───────────────────────────────────────


def build_openings(rows: list[dict]) -> dict:
    # Group raw rows by opening family
    by_family: dict[str, list[dict]] = defaultdict(list)

    for row in rows:
        name = row.get("name", "").strip()
        pgn = row.get("pgn", "").strip()
        eco = row.get("eco", "").strip()

        if not name or not pgn:
            continue
        if count_moves(pgn) < MIN_MOVES:
            continue

        family, variation_name = parse_name(name)

        by_family[family].append(
            {
                "name": name,
                "variation": variation_name,
                "eco": eco,
                "pgn": pgn,
                "move_count": count_moves(pgn),
            }
        )

    print(f"  → Found {len(by_family)} opening families")

    # Process each family
    result = {}
    skipped = 0

    for family, variations in sorted(by_family.items()):
        # Remove lines that are prefixes of longer lines in the same family
        leaves = remove_prefixes(variations)

        # Select the best N variations
        selected = select_variations(leaves)

        # Only include families with enough variations to be useful
        if len(selected) < MIN_VARIATIONS:
            skipped += 1
            continue

        result[family] = {
            "family": family,
            "variation_count": len(selected),
            "variations": selected,
        }

    print(
        f"  → Kept {len(result)} families (skipped {skipped} with <{MIN_VARIATIONS} variations)"
    )
    return result


# ── Step 7: Write output ──────────────────────────────────────────────────────


def write_output(data: dict, path: str):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    total_vars = sum(v["variation_count"] for v in data.values())
    print(f"  → Wrote {len(data)} openings, {total_vars} total variations → {path}")


# ── Main ──────────────────────────────────────────────────────────────────────


def main():
    print("=== Chess Openings Pipeline ===\n")

    rows = load_all_rows()
    print()

    print("Building openings structure...")
    openings = build_openings(rows)
    print()

    print("Writing output...")
    write_output(openings, OUTPUT_FILE)
    print("\nDone! 🎉")

    # Print a sample to verify
    sample_family = next(iter(openings))
    sample = openings[sample_family]
    print(f"\nSample — '{sample_family}' ({sample['variation_count']} variations):")
    for v in sample["variations"][:3]:
        print(f"  [{v['eco']}] {v['name']}")
        print(f"         {v['pgn'][:80]}...")


if __name__ == "__main__":
    main()
