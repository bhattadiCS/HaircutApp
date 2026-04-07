function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toPercent(value) {
  return Number((value * 100).toFixed(2));
}

export function getFaceFocusStyle(focusBox) {
  if (!focusBox) {
    return undefined;
  }

  const focalX = toPercent(focusBox.centerX);
  // Shift focal target up to give more room for hair
  const rawY = focusBox.compositionY ?? focusBox.centerY;
  const paddingY = 0.15; // Shift up by 15% of the image to keep hair visible
  const focalY = toPercent(Math.max(0.1, rawY - paddingY));
  
  // Also reduce zoom slightly so we see the full volume of the haircut
  const adjustedZoom = Math.max(1, focusBox.zoom * 0.85);

  return {
    objectPosition: `${focalX}% ${focalY}%`,
    transform: `scale(${adjustedZoom})`,
    transformOrigin: `${focalX}% ${focalY}%`,
  };
}

function getCoverSourceRect(image, targetWidth, targetHeight, focusBox) {
  const targetAspectRatio = targetWidth / targetHeight;
  const imageAspectRatio = image.width / image.height;

  let cropWidth = image.width;
  let cropHeight = image.height;

  if (imageAspectRatio > targetAspectRatio) {
    cropWidth = cropHeight * targetAspectRatio;
  } else {
    cropHeight = cropWidth / targetAspectRatio;
  }

  if (!focusBox) {
    return {
      sx: (image.width - cropWidth) / 2,
      sy: (image.height - cropHeight) / 2,
      sw: cropWidth,
      sh: cropHeight,
    };
  }

  // Adjust zoom down to show the hair outline
  const adjustedZoom = Math.max(1, focusBox.zoom * 0.85);
  cropWidth /= adjustedZoom;
  cropHeight /= adjustedZoom;

  const centerX = focusBox.centerX * image.width;
  
  // Shift center up to give more headroom
  const rawY = focusBox.compositionY ?? focusBox.centerY;
  const paddingY = 0.15;
  const centerY = Math.max(0.1, rawY - paddingY) * image.height;
  
  const sx = clamp(centerX - cropWidth / 2, 0, image.width - cropWidth);
  const sy = clamp(centerY - cropHeight / 2, 0, image.height - cropHeight);

  return {
    sx,
    sy,
    sw: cropWidth,
    sh: cropHeight,
  };
}

export function drawFocusedCover(context, image, targetRect, focusBox) {
  const { sx, sy, sw, sh } = getCoverSourceRect(
    image,
    targetRect.width,
    targetRect.height,
    focusBox,
  );

  context.drawImage(
    image,
    sx,
    sy,
    sw,
    sh,
    targetRect.x,
    targetRect.y,
    targetRect.width,
    targetRect.height,
  );
}