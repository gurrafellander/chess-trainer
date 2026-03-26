import rawOpenings from "../eco_conversion/openings.json"

export const openings = rawOpenings.map(opening => ({
  name: opening.name,
  variations: opening.variations.map(v => v.moves)
}));
