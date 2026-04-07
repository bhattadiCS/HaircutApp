const INDEX = {
  foreheadTop: 10,
  chin: 152,
  leftCheek: 234,
  rightCheek: 454,
  leftJaw: 172,
  rightJaw: 397,
  leftForehead: 71,
  rightForehead: 301,
  noseBridge: 6,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function distance(leftPoint, rightPoint) {
  const deltaX = leftPoint.x - rightPoint.x;
  const deltaY = leftPoint.y - rightPoint.y;
  const deltaZ = (leftPoint.z ?? 0) - (rightPoint.z ?? 0);

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
}

function inferFaceShape({ faceAspectRatio, jawRatio, foreheadRatio }) {
  if (faceAspectRatio > 0.82 && jawRatio < 0.88) {
    return 'Round';
  }

  if (jawRatio > 0.92 && Math.abs(foreheadRatio - jawRatio) < 0.06) {
    return 'Square';
  }

  if (foreheadRatio > jawRatio + 0.08) {
    return 'Heart';
  }

  if (faceAspectRatio < 0.72) {
    return 'Oblong';
  }

  return 'Oval';
}

function extractTopBlendshapes(blendshapeGroups) {
  const categories = blendshapeGroups?.categories ?? [];

  return categories
    .slice()
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((category) => ({
      label: category.displayName || category.categoryName,
      score: Number(category.score.toFixed(2)),
    }));
}

function summarizeFocusBox(landmarks) {
  const xs = landmarks.map((landmark) => landmark.x);
  const ys = landmarks.map((landmark) => landmark.y);
  const left = clamp(Math.min(...xs), 0, 1);
  const right = clamp(Math.max(...xs), 0, 1);
  const top = clamp(Math.min(...ys), 0, 1);
  const bottom = clamp(Math.max(...ys), 0, 1);
  const width = clamp(right - left, 0.001, 1);
  const height = clamp(bottom - top, 0.001, 1);
  const centerX = clamp((left + right) / 2, 0, 1);
  const centerY = clamp((top + bottom) / 2, 0, 1);
  const compositionY = clamp(centerY - Math.min(0.08, height * 0.24), 0.18, 0.72);
  const zoom = Number(clamp(0.42 / Math.max(width, height), 1.04, 1.72).toFixed(3));

  return {
    left: Number(left.toFixed(3)),
    right: Number(right.toFixed(3)),
    top: Number(top.toFixed(3)),
    bottom: Number(bottom.toFixed(3)),
    width: Number(width.toFixed(3)),
    height: Number(height.toFixed(3)),
    centerX: Number(centerX.toFixed(3)),
    centerY: Number(centerY.toFixed(3)),
    compositionY: Number(compositionY.toFixed(3)),
    zoom,
  };
}

export function summarizeVisionFrame(result) {
  const landmarks = result?.faceLandmarks?.[0];

  if (!landmarks) {
    return {
      status: 'no-face',
      faceCount: 0,
      faceShape: 'Unknown',
      focusBox: null,
      metrics: null,
      topBlendshapes: [],
    };
  }

  const faceHeight = distance(landmarks[INDEX.foreheadTop], landmarks[INDEX.chin]);
  const cheekWidth = distance(landmarks[INDEX.leftCheek], landmarks[INDEX.rightCheek]);
  const jawWidth = distance(landmarks[INDEX.leftJaw], landmarks[INDEX.rightJaw]);
  const foreheadWidth = distance(
    landmarks[INDEX.leftForehead],
    landmarks[INDEX.rightForehead],
  );
  const faceAspectRatio = Number((cheekWidth / faceHeight).toFixed(3));
  const jawRatio = Number((jawWidth / cheekWidth).toFixed(3));
  const foreheadRatio = Number((foreheadWidth / cheekWidth).toFixed(3));
  const noseBridge = landmarks[INDEX.noseBridge];
  const yaw = Number(
    (
      ((landmarks[INDEX.rightCheek].x - noseBridge.x) -
        (noseBridge.x - landmarks[INDEX.leftCheek].x)) /
      cheekWidth
    ).toFixed(3),
  );
  const pitch = Number(
    (
      ((landmarks[INDEX.chin].y - noseBridge.y) -
        (noseBridge.y - landmarks[INDEX.foreheadTop].y)) /
      faceHeight
    ).toFixed(3),
  );
  const focusBox = summarizeFocusBox(landmarks);

  return {
    status: 'tracking',
    faceCount: result.faceLandmarks.length,
    faceShape: inferFaceShape({
      faceAspectRatio,
      jawRatio,
      foreheadRatio,
    }),
    focusBox,
    metrics: {
      faceAspectRatio,
      jawRatio,
      foreheadRatio,
      yaw,
      pitch,
    },
    topBlendshapes: extractTopBlendshapes(result.faceBlendshapes?.[0]),
  };
}

export function cloneVisionSnapshot(snapshot) {
  return snapshot ? JSON.parse(JSON.stringify(snapshot)) : null;
}