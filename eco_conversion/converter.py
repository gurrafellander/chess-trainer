"""
Chess Openings Data Pipeline
============================
Converts lichess-org/chess-openings TSV files into a structured JSON file
where each opening family has a curated list of 10-30 variations (PGN).

Usage:
    pip install requests chess
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

import chess

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
    print(f"  -> Loaded {len(rows)} total variations")
    return rows


# ── Step 2: Parse names into family / variation ───────────────────────────────


def parse_name(name: str) -> tuple[str, str]:
    if ":" in name:
        family, _, variation = name.partition(":")
        return family.strip(), variation.strip()
    return name.strip(), ""


# ── Step 3: Count moves in a PGN string ──────────────────────────────────────


def count_moves(pgn: str) -> int:
    tokens = re.sub(r"\d+\.", "", pgn).split()
    return len(tokens)


# ── Step 4: Remove prefix variations ─────────────────────────────────────────


def normalize_moves(pgn: str) -> str:
    return " ".join(re.sub(r"\d+\.", "", pgn).split())


def remove_prefixes(variations: list[dict]) -> list[dict]:
    """Keep only leaf variations — not a strict prefix of any longer line."""
    move_strs = [normalize_moves(v["pgn"]) for v in variations]
    keepers = []
    for i, moves_i in enumerate(move_strs):
        is_prefix = any(
            moves_j.startswith(moves_i + " ")
            for j, moves_j in enumerate(move_strs)
            if i != j and len(moves_j) > len(moves_i)
        )
        if not is_prefix:
            keepers.append(variations[i])
    return keepers


# ── Step 5: Compute final FEN by replaying PGN ───────────────────────────────


def compute_final_fen(pgn: str) -> str | None:
    """
    Replay a PGN move list and return a position key (first 4 FEN fields),
    stripping halfmove clock and fullmove number so transpositions match.
    """
    board = chess.Board()
    tokens = re.sub(r"\d+\.", "", pgn).split()
    try:
        for san in tokens:
            board.push_san(san)
    except Exception:
        return None
    fen_parts = board.fen().split()
    return " ".join(fen_parts[:4])  # position + turn + castling + en-passant


# ── Step 6: Deduplicate transpositions by final position ─────────────────────


def dedup_transpositions(variations: list[dict]) -> tuple[list[dict], int]:
    """
    For each unique final position keep the variation with the longest/most
    specific name. Returns (deduped list, number removed).
    """
    by_fen: dict[str, dict] = {}
    failed = 0

    for v in variations:
        fen = compute_final_fen(v["pgn"])
        if fen is None:
            failed += 1
            continue
        v = {**v, "_final_fen": fen}
        if fen not in by_fen:
            by_fen[fen] = v
        else:
            if len(v["name"]) > len(by_fen[fen]["name"]):
                by_fen[fen] = v

    result = list(by_fen.values())
    removed = len(variations) - len(result) - failed
    return result, removed


# ── Step 7: Deduplicate by player-move fingerprint ───────────────────────────


def player_move_fingerprint(pgn: str, playing_as: str) -> str:
    """
    Return only the moves made by the student's side as a joined string.
    Catches variations identical from the student's perspective but differing
    only in opponent responses.
    """
    tokens = re.sub(r"\d+\.", "", pgn).split()
    player_moves = tokens[0::2] if playing_as == "white" else tokens[1::2]
    return " ".join(player_moves)


def dedup_player_moves(
    variations: list[dict], playing_as: str
) -> tuple[list[dict], int]:
    """
    Among variations with the same player-move fingerprint, keep the longest.
    Returns (deduped list, number removed).
    """
    by_fp: dict[str, dict] = {}
    for v in variations:
        fp = player_move_fingerprint(v["pgn"], playing_as)
        if fp not in by_fp:
            by_fp[fp] = v
        elif v["move_count"] > by_fp[fp]["move_count"]:
            by_fp[fp] = v
    removed = len(variations) - len(by_fp)
    return list(by_fp.values()), removed


# ── Step 8: Select and sort variations per family ────────────────────────────

# Keywords that indicate a main/classical line — these sort to the top of their group
PRIORITY_KEYWORDS = {"main line", "classical", "main variation", "normal variation"}


def variation_group(variation_name: str) -> str:
    """
    Extract the primary sub-variation name (before the first comma).
    e.g. 'Hunt Variation, Mikenas Gambit' → 'Hunt Variation'
         'Four Pawns Attack'               → 'Four Pawns Attack'
         ''                                → '' (opening main line, sorts first)
    """
    if not variation_name:
        return ""
    return variation_name.split(",")[0].strip()


def is_priority(variation_name: str) -> bool:
    """True if the variation name contains a main/classical line keyword."""
    lower = variation_name.lower()
    return any(kw in lower for kw in PRIORITY_KEYWORDS)


def select_variations(
    variations: list[dict], max_n: int = MAX_VARIATIONS
) -> list[dict]:
    """
    1. Take the top max_n deepest variations (by move count).
    2. Re-sort the selected set so that:
       - Sub-variation groups are clustered together (alphabetically by group name,
         with the opening's main line '' group always first)
       - Within each group: priority entries (Main Line, Classical) first,
         then by move count descending
    """
    # First pass: pick the deepest max_n lines
    candidates = sorted(variations, key=lambda v: v["move_count"], reverse=True)[:max_n]

    def sort_key(v):
        group = variation_group(v["variation"])
        priority = 0 if is_priority(v["variation"]) else 1
        # Empty group (opening's own main line) always sorts before named groups
        group_order = ("", group) if group == "" else ("z", group)
        return (group_order, priority, -v["move_count"])

    return sorted(candidates, key=sort_key)


# ── Step 9: Build the output structure ───────────────────────────────────────


def build_openings(rows: list[dict]) -> dict:
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

    print(f"  -> Found {len(by_family)} opening families")

    result = {}
    skipped = 0
    total_trans = 0
    total_player = 0

    for family, variations in sorted(by_family.items()):
        playing_as = "black" if "Defense" in family else "white"

        # 1. Remove prefix lines
        after_prefix = remove_prefixes(variations)

        # 2. Deduplicate transpositions (same final board position)
        after_fen, n_trans = dedup_transpositions(after_prefix)
        total_trans += n_trans

        # 3. Deduplicate by player-move fingerprint
        after_player, n_player = dedup_player_moves(after_fen, playing_as)
        total_player += n_player

        # 4. Pick top N by depth
        selected = select_variations(after_player)

        if len(selected) < MIN_VARIATIONS:
            skipped += 1
            continue

        # Strip internal fields
        clean = [
            {k: v for k, v in var.items() if not k.startswith("_")} for var in selected
        ]

        result[family] = {
            "family": family,
            "variation_count": len(clean),
            "removed_transpositions": n_trans,
            "removed_player_dups": n_player,
            "variations": clean,
        }

    print(
        f"  -> Kept {len(result)} families (skipped {skipped} with <{MIN_VARIATIONS} variations)"
    )
    print(f"  -> Removed {total_trans} transpositions across all families")
    print(f"  -> Removed {total_player} player-move duplicates across all families")
    return result


# ── Step 10: Write output ─────────────────────────────────────────────────────


def write_output(data: dict, path: str):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    total_vars = sum(v["variation_count"] for v in data.values())
    print(f"  -> Wrote {len(data)} openings, {total_vars} total variations -> {path}")


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
    print("\nDone!")

    # Print a sample with dedup stats
    sample_family = next(iter(openings))
    sample = openings[sample_family]
    print(f"\nSample — '{sample_family}':")
    print(f"  {sample['variation_count']} variations kept")
    print(f"  {sample['removed_transpositions']} transpositions removed")
    print(f"  {sample['removed_player_dups']} player-move duplicates removed")
    for v in sample["variations"][:3]:
        print(f"  [{v['eco']}] {v['name']}")
        print(f"         {v['pgn'][:80]}...")


if __name__ == "__main__":
    main()
