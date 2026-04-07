import { buildTechniqueDigest, retrieveBarberContext } from './retrieveBarberContext';

const hairTextureByType = {
  Short: 'compact crop texture with tight perimeter control',
  Medium: 'natural bend with enough length for directional movement',
  Long: 'flow-oriented texture with visible strand travel',
};

const vibeDirections = {
  street: 'directional texture and visible contrast',
  classic: 'clean taper discipline and restrained weight',
  flow: 'softer perimeter and natural movement through the top',
};

function computeGoldenRatioScore(visionSnapshot) {
  const aspectRatio = visionSnapshot?.metrics?.faceAspectRatio;

  if (!aspectRatio) {
    return 82;
  }

  const delta = Math.abs(0.72 - aspectRatio);
  return Math.round(Math.max(74, 92 - delta * 100));
}

function buildCompatibility(style, faceShape) {
  return style?.bestFor?.includes(faceShape) ? 'High' : 'Moderate';
}

function buildBarberBrief(style, faceShape, technicalContext) {
  const primarySheet = technicalContext[0];

  if (!primarySheet) {
    return `Section at the parietal ridge. Use controlled scissor-over-comb through the transition and tune the perimeter for a ${faceShape.toLowerCase()} face.`;
  }

  return `Section with ${primarySheet.sectioning}. ${primarySheet.clipper}. ${primarySheet.finish}. Keep the silhouette tuned for a ${faceShape.toLowerCase()} face.`;
}

export function buildOfflineLookPlan({ style, vibe, visionSnapshot }) {
  const faceShape = visionSnapshot?.faceShape ?? style?.bestFor?.[0] ?? 'Oval';
  const compatibility = buildCompatibility(style, faceShape);
  const technicalContext = retrieveBarberContext({
    styleName: style?.name,
    vibe,
  });
  const preferredProfiles = style?.bestFor?.join(', ') ?? 'oval, square';
  const hairTexture =
    hairTextureByType[style?.type] ?? 'balanced texture with natural movement';
  const vibeDirection =
    vibeDirections[vibe] ?? 'balanced silhouette and controlled weight placement';

  const advice =
    compatibility === 'High'
      ? `${style?.name} fits a ${faceShape.toLowerCase()} profile well. Lean into ${vibeDirection}.`
      : `${style?.name} can still work, but keep the transition softer because ${preferredProfiles.toLowerCase()} profiles usually carry this silhouette more easily.`;

  return {
    faceShape,
    hairTexture,
    compatibility,
    advice,
    barberBrief: buildBarberBrief(style, faceShape, technicalContext),
    goldenRatioScore: computeGoldenRatioScore(visionSnapshot),
    technicalContext,
    technicalSummary: buildTechniqueDigest(technicalContext),
    processSteps: [
      `Profiling ${faceShape} geometry...`,
      `Mapping ${hairTexture.toLowerCase()}...`,
      compatibility === 'High' ? 'Locking a strong match...' : 'Balancing the silhouette...',
      'Pulling barber references...',
      'Staging the preview...',
    ],
    source: 'offline-heuristic',
  };
}