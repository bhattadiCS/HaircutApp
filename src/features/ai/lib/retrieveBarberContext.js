import barberTechnicalSheets from '../../../data/barber_vdb/technicalSheets.seed.json';

function normalizeText(value = '') {
  return value.toLowerCase();
}

function tokenize(...parts) {
  return parts
    .flatMap((part) => normalizeText(part).split(/[^a-z0-9]+/))
    .filter(Boolean);
}

export function retrieveBarberContext({ styleName = '', vibe = '', desiredCount = 2 }) {
  const requestedTokens = new Set(tokenize(styleName, vibe));

  const rankedSheets = barberTechnicalSheets
    .map((sheet) => {
      const sheetTokens = tokenize(sheet.title, sheet.sectioning, ...(sheet.keywords ?? []));
      const score = sheetTokens.reduce(
        (total, token) => total + (requestedTokens.has(token) ? 2 : 0),
        0,
      );

      return {
        sheet,
        score,
      };
    })
    .sort((left, right) => right.score - left.score);

  return rankedSheets
    .filter((entry) => entry.score > 0)
    .slice(0, desiredCount)
    .map((entry) => entry.sheet);
}

export function buildTechniqueDigest(entries) {
  if (!entries.length) {
    return 'No local technical references have been loaded yet.';
  }

  return entries
    .map((entry) => `${entry.title}: ${entry.angles}; ${entry.finish}.`)
    .join(' ');
}