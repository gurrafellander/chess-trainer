import rawOpenings from "../openings.json"

const parsePgn = (pgn) =>
  pgn
    .replace(/\d+\./g, '')   // remove "1." "2." etc
    .trim()
    .split(/\s+/)             // split on whitespace
    .filter(Boolean);         // drop empty strings

export const openings = Object.values(rawOpenings).map(opening => ({
  name: opening.family,
  variations: opening.variations.map(v => ({
    name: v.name,
    variation: v.variation,
    eco: v.eco,
    moves: parsePgn(v.pgn),
  }))
}));
