import json
import re
from chess import Board
import os

# ---------- CONFIG ----------

MIN_MOVES = 6
MAX_MOVES = 12
MAX_VARIATIONS_PER_OPENING = 30

ECO_FILES = ["ecoA.json", "ecoB.json", "ecoC.json", "ecoD.json", "ecoE.json"]

# Viktiga openings + deras definierande prefix (från 365chess)
IMPORTANT_OPENINGS = {
    "Ruy Lopez": ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    "Italian Game": ["e4", "e5", "Nf3", "Nc6", "Bc4"],
    "Scotch Game": ["e4", "e5", "Nf3", "Nc6", "d4"],
    "Sicilian Defense": ["e4", "c5"],
    "French Defense": ["e4", "e6"],
    "Caro-Kann Defense": ["e4", "c6"],
    "Scandinavian Defense": ["e4", "d5"],
    "Pirc Defense": ["e4", "d6", "d4", "Nf6"],
    "Modern Defense": ["e4", "g6"],
    "Alekhine Defense": ["e4", "Nf6"],
    "King's Gambit": ["e4", "e5", "f4"],
    "Vienna Game": ["e4", "e5", "Nc3"],
    "Queen's Gambit": ["d4", "d5", "c4"],
    "Slav Defense": ["d4", "d5", "c4", "c6"],
    "King's Indian Defense": ["d4", "Nf6", "c4", "g6"],
    "Grunfeld Defense": ["d4", "Nf6", "c4", "g6", "Nc3", "d5"],
    "Benoni Defense": ["d4", "Nf6", "c4", "c5"],
    "Queen's Indian Defense": ["d4", "Nf6", "c4", "e6", "Nf3", "b6"],
    "London System": ["d4", "d5", "Bf4"],
    "Colle System": ["d4", "d5", "Nf3", "e3"],
}

# ---------- HELPERS ----------


def clean_moves(move_string):
    return re.sub(r"\d+\.", "", move_string).strip().split()


def starts_with(moves, prefix):
    return moves[: len(prefix)] == prefix


def get_fen(moves):
    board = Board()
    try:
        for m in moves:
            board.push_san(m)
        return board.fen()
    except:
        return None


def dedupe_variations(variations):
    seen = set()
    result = []

    for moves in variations:
        key = " ".join(moves[:10])
        if key in seen:
            continue
        seen.add(key)
        result.append(moves)

    return result


def remove_prefix_variations(variations):
    """
    Behåll endast längsta varianter.
    Om en variant är prefix till en annan → bort.
    """
    result = []

    # längsta först
    variations_sorted = sorted(variations, key=len, reverse=True)

    for v in variations_sorted:
        if any(starts_with(existing, v) for existing in result):
            continue
        result.append(v)

    return result


# ---------- LOAD DATA ----------


def load_eco_files():
    all_data = []

    for filename in ECO_FILES:
        if not os.path.exists(filename):
            print(f"Warning: {filename} not found, skipping.")
            continue

        with open(filename, "r", encoding="utf-8") as f:
            data = json.load(f)
            all_data.extend(data.values())

        print(f"Loaded {filename} ({len(data)} entries)")

    print(f"\nTotal entries loaded: {len(all_data)}\n")

    return all_data


# ---------- CORE BUILDER ----------


def build_openings(eco_data):
    openings = []

    # Pre-clean alla entries
    cleaned_entries = []

    for entry in eco_data:
        if "moves" not in entry:
            continue

        moves = clean_moves(entry["moves"])

        if len(moves) < MIN_MOVES:
            continue

        cleaned_entries.append(moves)

    print(f"Usable move sequences: {len(cleaned_entries)}")

    # 🔹 För varje viktig opening
    for name, prefix in IMPORTANT_OPENINGS.items():
        variations = []

        for moves in cleaned_entries:
            if starts_with(moves, prefix):
                trimmed = moves[:MAX_MOVES]
                variations.append(trimmed)

        if not variations:
            continue

        # 🔹 Dedupe
        variations = dedupe_variations(variations)

        # 🔹 Ta bort prefix-varianter (behåll bara längsta)
        variations = remove_prefix_variations(variations)

        # 🔹 Begränsa
        variations = variations[:MAX_VARIATIONS_PER_OPENING]

        structured = []

        for v in variations:
            fen = get_fen(v)
            structured.append({"moves": v, "fen": fen})

        openings.append({"name": name, "prefix": prefix, "variations": structured})

    return openings


# ---------- SUMMARY ----------


def print_summary(openings):
    print("\n===== OPENING SUMMARY =====\n")

    openings = sorted(openings, key=lambda o: len(o["variations"]), reverse=True)

    for o in openings:
        variations = [v["moves"] for v in o["variations"]]

        if not variations:
            continue

        variations_sorted = sorted(variations, key=len)

        shortest = variations_sorted[0]
        longest = variations_sorted[-1]

        print(f"Opening: {o['name']}")
        print(f"Prefix: {' '.join(o['prefix'])}")
        print(f"Variations: {len(variations)}")

        print("Shortest:")
        print("  ", " ".join(shortest))

        print("Longest:")
        print("  ", " ".join(longest))

        print("-" * 60)


# ---------- EXPORT ----------


def export_to_json(openings, filename="openings.json"):
    clean_output = []

    for o in openings:
        clean_output.append({"name": o["name"], "variations": o["variations"]})

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(clean_output, f, indent=2)

    print(f"\nExported to {filename}")


# ---------- MAIN ----------

if __name__ == "__main__":
    eco_data = load_eco_files()

    openings = build_openings(eco_data)

    print_summary(openings)

    export_to_json(openings)
